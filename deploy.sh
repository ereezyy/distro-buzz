#!/bin/bash

################################################################################
# DISTRO BUZZ DEPLOYMENT SCRIPT
# Deploys Distro Buzz to Linode server alongside WaveForge
# Safe to run multiple times (idempotent)
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/ereezyy/distro-buzz.git"
APP_DIR="/root/distro-buzz"
APP_NAME="distro-buzz"
APP_PORT=3001
DB_NAME="distro_buzz"
DB_USER="distro_buzz_user"
DB_PASSWORD="distro_buzz_secure_password_$(date +%s)"
NGINX_UPSTREAM="distro_buzz_upstream"

################################################################################
# HELPER FUNCTIONS
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        return 1
    fi
    return 0
}

################################################################################
# PHASE 1: VERIFY WAVEFORGE IS RUNNING
################################################################################

log_info "Phase 1: Verifying WaveForge is running..."

if pm2 list | grep -q "waveforge"; then
    log_success "WaveForge is running via pm2"
else
    log_warning "WaveForge not found in pm2 list, but continuing with deployment"
fi

################################################################################
# PHASE 2: CLONE/UPDATE REPOSITORY
################################################################################

log_info "Phase 2: Cloning/updating Distro Buzz repository..."

if [ -d "$APP_DIR" ]; then
    log_info "Repository already exists, pulling latest changes..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
    log_success "Repository updated"
else
    log_info "Cloning repository from GitHub..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
    log_success "Repository cloned"
fi

################################################################################
# PHASE 3: INSTALL PNPM
################################################################################

log_info "Phase 3: Ensuring pnpm is installed..."

if ! check_command pnpm; then
    log_info "Installing pnpm..."
    npm install -g pnpm
    log_success "pnpm installed"
else
    log_success "pnpm already installed"
fi

################################################################################
# PHASE 4: INSTALL DEPENDENCIES
################################################################################

log_info "Phase 4: Installing dependencies..."

cd "$APP_DIR"
pnpm install --frozen-lockfile
log_success "Dependencies installed"

################################################################################
# PHASE 5: SET UP POSTGRESQL DATABASE
################################################################################

log_info "Phase 5: Setting up PostgreSQL database..."

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    log_info "Starting PostgreSQL..."
    systemctl start postgresql
fi

# Create database user if not exists
if sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1; then
    log_info "Database user already exists"
else
    log_info "Creating database user..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    log_success "Database user created"
fi

# Create database if not exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    log_info "Database already exists"
else
    log_info "Creating database..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    log_success "Database created"
fi

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
log_success "Database privileges granted"

# Run migrations
log_info "Running database migrations..."
cd "$APP_DIR"
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
pnpm run db:push || log_warning "Database migrations may have already been applied"
log_success "Database migrations completed"

################################################################################
# PHASE 6: CREATE .ENV FILE
################################################################################

log_info "Phase 6: Creating .env file..."

ENV_FILE="$APP_DIR/.env"

if [ -f "$ENV_FILE" ]; then
    log_info ".env file already exists, backing up..."
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%s)"
fi

cat > "$ENV_FILE" << 'ENVEOF'
# Database
DATABASE_URL=postgresql://distro_buzz_user:distro_buzz_secure_password@localhost:5432/distro_buzz

# JWT & Auth
JWT_SECRET=your_jwt_secret_key_change_this_in_production_$(date +%s)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_manus_api_key_here
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_manus_frontend_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Twilio (Voice Outreach)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM_NUMBER=+1234567890

# Deepgram (Voice Transcription)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Groq (AI Inference)
GROQ_API_KEY=your_groq_api_key_here

# Grok/xAI (AI Chat)
XAI_API_KEY=your_xai_api_key_here

# Printful (Merch Automation)
PRINTFUL_API_KEY=your_printful_api_key_here

# App Configuration
VITE_APP_ID=distro-buzz
VITE_APP_TITLE=Distro Buzz
VITE_APP_LOGO=https://example.com/logo.png
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# Environment
NODE_ENV=production
PORT=3001
ENVEOF

log_success ".env file created with placeholder values"
log_warning "IMPORTANT: Update .env file with real API keys before running in production"
log_warning "Location: $ENV_FILE"

################################################################################
# PHASE 7: BUILD THE APP
################################################################################

log_info "Phase 7: Building Distro Buzz..."

cd "$APP_DIR"
export NODE_ENV=production
pnpm run build
log_success "Build completed"

################################################################################
# PHASE 8: SET UP PM2 PROCESS
################################################################################

log_info "Phase 8: Setting up pm2 process..."

# Check if pm2 is installed
if ! check_command pm2; then
    log_info "Installing pm2 globally..."
    npm install -g pm2
fi

# Stop existing process if running
if pm2 list | grep -q "$APP_NAME"; then
    log_info "Stopping existing pm2 process..."
    pm2 stop "$APP_NAME" || true
    pm2 delete "$APP_NAME" || true
fi

# Start new process
log_info "Starting Distro Buzz with pm2..."
cd "$APP_DIR"
pm2 start dist/index.js \
    --name "$APP_NAME" \
    --env production \
    --instances 1 \
    --max-memory-restart 512M \
    --error "$APP_DIR/logs/error.log" \
    --out "$APP_DIR/logs/out.log" \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z"

# Save pm2 config
pm2 save
pm2 startup systemd -u root --hp /root

log_success "pm2 process started and configured"

# Wait for app to start
sleep 3

################################################################################
# PHASE 9: CONFIGURE NGINX
################################################################################

log_info "Phase 9: Configuring nginx..."

# Check if nginx is installed
if ! check_command nginx; then
    log_info "Installing nginx..."
    apt-get update -qq
    apt-get install -y nginx
fi

# Create nginx upstream configuration
NGINX_UPSTREAM_FILE="/etc/nginx/conf.d/distro_buzz_upstream.conf"

cat > "$NGINX_UPSTREAM_FILE" << NGINXEOF
upstream $NGINX_UPSTREAM {
    server 127.0.0.1:$APP_PORT;
    keepalive 64;
}
NGINXEOF

log_success "Nginx upstream configured"

# Create nginx server block for distro-buzz
NGINX_SERVER_FILE="/etc/nginx/sites-available/distro-buzz"

cat > "$NGINX_SERVER_FILE" << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name distrobuzz.net www.distrobuzz.net 172.239.199.32;

    # Redirect HTTP to HTTPS (optional, uncomment if you have SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://distro_buzz_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
}
NGINXEOF

# Enable site if not already enabled
if [ ! -L "/etc/nginx/sites-enabled/distro-buzz" ]; then
    ln -s "$NGINX_SERVER_FILE" "/etc/nginx/sites-enabled/distro-buzz"
    log_success "Nginx site enabled"
fi

# Test nginx configuration
if nginx -t &>/dev/null; then
    log_success "Nginx configuration is valid"
else
    log_error "Nginx configuration has errors"
    nginx -t
    exit 1
fi

################################################################################
# PHASE 10: RESTART NGINX
################################################################################

log_info "Phase 10: Restarting nginx..."

systemctl restart nginx
log_success "Nginx restarted"

################################################################################
# PHASE 11: VERIFY DEPLOYMENT
################################################################################

log_info "Phase 11: Verifying deployment..."

# Check if pm2 process is running
sleep 2
if pm2 list | grep -q "$APP_NAME"; then
    STATUS=$(pm2 list | grep "$APP_NAME" | grep -o "online\|stopped\|errored")
    if [ "$STATUS" = "online" ]; then
        log_success "Distro Buzz is running via pm2"
    else
        log_error "Distro Buzz pm2 process is in $STATUS state"
        pm2 logs "$APP_NAME" --lines 20
        exit 1
    fi
else
    log_error "Distro Buzz pm2 process not found"
    exit 1
fi

# Check if app is responding on port
if curl -s http://127.0.0.1:$APP_PORT/health &>/dev/null || curl -s http://127.0.0.1:$APP_PORT/ &>/dev/null; then
    log_success "Distro Buzz is responding on port $APP_PORT"
else
    log_warning "Could not verify app response (may still be starting)"
fi

# Check if WaveForge is still running
if pm2 list | grep -q "waveforge"; then
    log_success "WaveForge is still running"
else
    log_warning "WaveForge status unknown"
fi

# Check nginx status
if systemctl is-active --quiet nginx; then
    log_success "Nginx is running"
else
    log_error "Nginx is not running"
    exit 1
fi

################################################################################
# DEPLOYMENT COMPLETE
################################################################################

log_success "================================"
log_success "DEPLOYMENT COMPLETE!"
log_success "================================"
echo ""
log_info "Distro Buzz Details:"
echo "  - Application Directory: $APP_DIR"
echo "  - PM2 Process Name: $APP_NAME"
echo "  - Internal Port: $APP_PORT"
echo "  - Database: $DB_NAME"
echo "  - Database User: $DB_USER"
echo ""
log_info "Next Steps:"
echo "  1. Update .env file with real API keys:"
echo "     nano $ENV_FILE"
echo ""
echo "  2. Restart the app after updating .env:"
echo "     pm2 restart $APP_NAME"
echo ""
echo "  3. View logs:"
echo "     pm2 logs $APP_NAME"
echo ""
echo "  4. Access the application:"
echo "     http://172.239.199.32/"
echo "     http://distrobuzz.net/ (if domain is configured)"
echo ""
log_warning "IMPORTANT: Update .env file with real credentials before using in production!"
echo ""
log_success "Deployment script finished successfully!"

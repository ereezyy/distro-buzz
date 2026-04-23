# Multi-stage build for Maestro

# Stage 1: Development
FROM node:18-alpine AS development

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml package.json ./
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Expose ports
EXPOSE 3000 3001

# Default command (overridden by docker-compose)
CMD ["npm", "run", "dev"]

---

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml package.json ./
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build application
RUN pnpm run build

---

# Stage 3: Production
FROM node:18-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml package.json ./
COPY packages ./packages

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/index.js"]

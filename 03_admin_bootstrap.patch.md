# Patch 03 — Admin user bootstrap

**File:** `scripts/bootstrap_admin.mjs` (new)

## What this is

Resolves the chicken/egg in the admin scaffolding: routes, dashboard link, backend
mutations, and schema all already exist in the Manus codebase. **Nothing was missing
on the UI/server side.** What's missing is a one-shot CLI to flip a user's row
from `role='user'` to `role='admin'` so you can actually use the existing admin
dashboard at `/admin`.

The TODO_CLEAN.md item "Add admin route to App.tsx" was misleading — that route
exists already (App.tsx:42). Same for the Dashboard admin link (Dashboard.tsx:160,
gated on `user?.role === 'admin'`). What was actually missing was bootstrap.

## What the script does

1. Find user by email (case-insensitive)
2. Sets `role = 'admin'`
3. Sets `credits = 1000`
4. Sets `hasCompletedOnboarding = true` (skips the welcome flow for the admin)
5. Prints before/after, validates the update took, exits non-zero on failure
6. Idempotent — safe to re-run

## Pre-req

You must already have a regular user account (signed up via email/Google/GitHub).
The script can only promote *existing* users. It refuses to create new accounts —
that path goes through the normal signup flow.

## Deploy

```bash
# from your laptop:
scp bootstrap_admin.mjs root@172.239.199.32:/root/waveforge/scripts/

# on the Linode:
cd /root/waveforge
ls scripts/   # confirm it's there

# DATABASE_URL must be in env. If pm2 starts it but env isn't in shell, source it:
source /etc/waveforge/.env  # or wherever your env file lives
# OR load from ecosystem.config.cjs:
export DATABASE_URL=$(node -e "console.log(require('./ecosystem.config.cjs').apps[0].env.DATABASE_URL)")

# run it (replace with your actual signup email)
node scripts/bootstrap_admin.mjs ereezy@gmail.com

# expected output:
# before:
#   id:       <N>
#   email:    ereezy@gmail.com
#   role:     user
#   credits:  1
#
# after:
#   id:       <N>
#   email:    ereezy@gmail.com
#   role:     admin
#   credits:  1000
#
# ✓ ereezy@gmail.com is now admin. log out + back in to refresh your session.
```

## Verify

1. log out at https://waveforge.net (kills the old session)
2. log back in
3. open the dashboard — should now see an "Admin" link
4. click it — `/admin/users` should load with the user list (using the existing
   AdminUsers.tsx page wired to the existing adminRouter)
5. tabs should work: list users, change roles, add credits, ban

If the admin link doesn't appear, the session cache might still have the old role.
hard refresh (cmd+shift+R / ctrl+shift+R) and check `/api/auth/me` directly:

```bash
# in the browser devtools, in the Network tab, find the /api/auth/me response
# it should now show role: 'admin'
```

If it still says 'user', the JWT/session was cached. logout fully (clear cookies
for waveforge.net) and re-login.

## What this DOESN'T do

- doesn't create a new admin user (only promotes existing)
- doesn't grant admin access via OAuth tokens (the role flip is at the DB layer)
- doesn't lock the admin to a specific email going forward — anyone with DB access
  can run this on any email. that's by design for a single-operator product. if you
  ever onboard team members, replace with a more restrictive flow.
- doesn't audit log the promotion. add `console.log` to a file or a real audit table
  if you need that for compliance.

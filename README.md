# unenv

AI-powered .env file manager - scan, validate, and generate environment variable configurations.

[![npm version](https://badge.fury.io/js/unenv.svg)](https://www.npmjs.com/package/unenv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/muinmomin/unenv.svg?style=social)](https://github.com/muinmomin/unenv)

Stop manually maintaining `.env.example` files. Let `unenv` automatically detect environment variables from your codebase.

## What is this?

`unenv` scans your code for environment variables, generates documented `.env.example` files, and validates your configuration. Works with Node.js, Python, Ruby, Go, and PHP.

## Why use this?

**Before:**
```bash
# New developer joins the team
New Dev: "What environment variables do I need?"
You: "Check the .env.example file"
New Dev: "It's outdated and missing half the variables"
You: "Oh yeah, I forgot to update it..."

# Meanwhile in production:
*app crashes*
Error: Missing required environment variable: REDIS_URL
# That variable was added 2 months ago
# Nobody updated .env.example
# Nobody told DevOps
```

**After:**
```bash
$ unenv scan

Missing from .env (3):
  • DATABASE_URL (used in src/db.js:15)
  • API_KEY (used in src/api.js:8)
  • REDIS_HOST (used in src/cache.js:23)

$ unenv generate
Created .env.example with 12 variables

$ unenv check --strict
All variables configured correctly
```

**Real pain points:**
- `.env.example` gets outdated immediately
- New developers don't know what variables they need
- Production breaks because of missing config
- No visibility into where variables are actually used
- Manual maintenance is tedious and error-prone

`unenv` scans your code, finds all environment variables, and keeps documentation in sync automatically.

## Installation

```bash
npm install -g unenv
```

Or use without installing:
```bash
npx unenv scan
```

## Quick Start

```bash
# Scan your project
unenv scan

# Generate .env.example
unenv generate

# Validate configuration
unenv check
```

## Examples

### Example 1: New project onboarding

```bash
$ git clone https://github.com/company/api-service.git
$ cd api-service
$ npm install

# What environment variables do I need?
$ unenv scan

Analyzed 38 files
Found 15 environment variables

Missing from .env (15):
  • DATABASE_URL (used in src/db/connection.js:12)
  • JWT_SECRET (used in src/auth/jwt.js:5)
  • AWS_ACCESS_KEY_ID (used in src/storage/s3.js:8)
  • AWS_SECRET_ACCESS_KEY (used in src/storage/s3.js:9)
  • REDIS_URL (used in src/cache/redis.js:7)
  • STRIPE_API_KEY (used in src/payments/stripe.js:14)
  • SMTP_HOST (used in src/email/mailer.js:19)
  • SMTP_PORT (used in src/email/mailer.js:20)
  • SMTP_USER (used in src/email/mailer.js:21)
  • SMTP_PASS (used in src/email/mailer.js:22)
  • NODE_ENV (used in src/config/index.js:3)
  • PORT (used in src/server.js:45)
  • LOG_LEVEL (used in src/logger.js:8)
  • SESSION_SECRET (used in src/middleware/session.js:11)
  • API_RATE_LIMIT (used in src/middleware/rate-limit.js:6)

# Generate template
$ unenv generate
Created .env.example with 15 variables

# Copy and fill in values
$ cp .env.example .env
$ nano .env  # fill in real values

# Verify everything is configured
$ unenv check
Configuration checked - all variables present ✓
```

### Example 2: Pre-deployment CI check

```bash
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      # Check environment configuration
      - name: Validate environment variables
        run: npx unenv check --strict
      
      # This fails if:
      # - Required variables are missing from .env.example
      # - Variables in code aren't documented
```

**Output on failure:**
```
Configuration checked

Missing Variables (2):
  • NEW_API_ENDPOINT
    Used in: src/integrations/new-service.js:15
  
  • FEATURE_FLAG_X
    Used in: src/features/x.js:8

Error: Missing required environment variables
```

### Example 3: Finding unused variables during cleanup

```bash
$ unenv check

Configuration checked

Environment Configuration Report
═══════════════════════════════════════════════════════

Summary:
  Required variables: 18
  Configured: 23
  Missing: 0
  Unused: 5

Unused Variables (5):
These are in .env but not used in your code

  • OLD_PAYMENT_API_KEY
    Possibly left over from migration to Stripe
  
  • LEGACY_DATABASE_URL
    May be safe to remove
  
  • FEATURE_TOGGLE_BETA
    Feature might be fully launched now
  
  • TWILIO_AUTH_TOKEN
    Switched to SendGrid 3 months ago?
  
  • REDIS_PASSWORD
    Redis now uses REDIS_URL

Consider removing unused variables or checking if they're still needed.
```

**Clean up:**
```bash
# Review and remove from .env
$ nano .env  # remove unused vars

# Verify
$ unenv check
Configuration checked - all variables present ✓
No unused variables found
```

### Example 4: Multi-environment validation

```bash
# Development environment
$ unenv check --env .env.development
Configuration checked - all variables present ✓

# Staging environment
$ unenv check --env .env.staging
Missing Variables (1):
  • DATABASE_URL
    Used in: src/db/connection.js:12

# Production environment
$ unenv check --env .env.production
Missing Variables (2):
  • SENTRY_DSN
    Used in: src/monitoring/sentry.js:5
  
  • CDN_URL
    Used in: src/assets/cdn.js:8

Unused Variables (1):
  • DEBUG_MODE
    (not used in production - should be removed)
```

**Use case:** Catch environment-specific configuration issues before deploying.

### Example 5: Detailed variable usage tracking

```bash
$ unenv scan --verbose

DATABASE_URL:
  - src/db/connection.js:12
  - src/models/user.js:23
  - src/models/post.js:19
  - tests/integration/db.test.js:8
  - scripts/migrate.js:15

JWT_SECRET:
  - src/auth/jwt.js:5
  - src/middleware/auth.js:34
  - tests/unit/auth.test.js:12

AWS_ACCESS_KEY_ID:
  - src/storage/s3.js:8
  - src/backup/uploader.js:44

$ unenv scan --verbose --json > env-usage-map.json

# Now you can:
# - See which files depend on each variable
# - Understand impact of changing a variable
# - Plan refactoring (e.g., moving AWS creds to IAM roles)
# - Generate dependency graphs
```

## Commands

### unenv scan

Scan your codebase and compare with `.env` file.

```bash
$ unenv scan
```

Output:
```
Analyzed 42 files
Found 12 environment variables

Missing from .env (3):
  • DATABASE_URL
    Used in src/db.js:15
  • API_KEY
    Used in src/api.js:8
  • REDIS_HOST
    Used in src/cache.js:23

Found in .env (9):
  PORT, NODE_ENV, JWT_SECRET, AWS_REGION, SMTP_HOST, 
  SMTP_USER, SMTP_PASS, LOG_LEVEL, SESSION_SECRET
```

**Options:**
```
-d, --dir <directory>    Directory to scan (default: current)
-i, --ignore <patterns>  Comma-separated ignore patterns
--json                   Output as JSON
-v, --verbose            Show all file locations for each variable
```

**Verbose output:**
```bash
$ unenv scan --verbose

DATABASE_URL:
  - src/db.js:15
  - src/models/user.js:8
  - tests/integration/db.test.js:12
```

### unenv generate

Generate documented `.env.example` file with smart categorization.

```bash
$ unenv generate
```

Output:
```
Analyzed 42 files
Created .env.example with 12 variables

Preview:
────────────────────────────────────────
# Generated by unenv
# Last updated: 2025-02-05

# Database
# ────────────────────────────────────────

# Database connection string (URL format)
# Used in: src/db.js
DATABASE_URL=

# Redis host for caching
# Used in: src/cache.js
REDIS_HOST=

# Authentication
# ────────────────────────────────────────

# JWT secret key - keep secret! - DO NOT COMMIT!
# Used in: src/auth.js
JWT_SECRET=

# API key for external service - keep secret!
# Used in: src/api.js
API_KEY=

...
```

**Options:**
```
-d, --dir <directory>       Directory to scan
-o, --output <file>         Output file (default: .env.example)
-i, --ignore <patterns>     Ignore patterns
--no-categorize            Don't group by category
```

**Categories automatically detected:**
- Database (DB, DATABASE, SQL, MONGO, REDIS, etc.)
- Authentication (AUTH, JWT, SECRET, TOKEN, KEY, etc.)
- API & Services (API, SERVICE, ENDPOINT, etc.)
- Cloud & Infrastructure (AWS, GCP, AZURE, S3, etc.)
- Application (PORT, NODE_ENV, DEBUG, etc.)
- Email (SMTP, MAIL, EMAIL, etc.)
- Payment (STRIPE, PAYPAL, PAYMENT, etc.)

### unenv check

Validate your configuration - find missing and unused variables.

```bash
$ unenv check
```

Output:
```
Configuration checked

Environment Configuration Report
═══════════════════════════════════════════════════════

Summary:
  Required variables: 12
  Configured: 10
  Missing: 2
  Unused: 3

Missing Variables (2):
These are used in your code but not defined in .env

  • API_KEY
    Category: API & Services
    Used in: src/api.js:8

  • REDIS_HOST
    Category: Database
    Used in: src/cache.js:23

Unused Variables (3):
These are in .env but not used in your code

  • OLD_API_KEY
  • LEGACY_DB_URL
  • UNUSED_TOKEN

Consider removing unused variables or checking if they're still needed.
```

**Options:**
```
-d, --dir <directory>    Directory to scan
-e, --env <file>         Env file to check (default: .env)
-i, --ignore <patterns>  Ignore patterns
--fix                    Automatically add missing variables to .env
--strict                 Exit with error code if issues found (CI/CD)
```

**Auto-fix example:**
```bash
$ unenv check --fix

🔧 Auto-fixing missing variables...

✓ Added 2 variable(s) to .env
⚠️  Values are empty - please fill them in manually
```

The `--fix` flag:
- Adds missing variables to your `.env` file
- Groups them by category with helpful comments
- Leaves values empty for manual entry
- Never overwrites existing values
- Great for quickly scaffolding new environment variables

**CI/CD usage:**
```bash
# Fail build if environment is misconfigured
unenv check --strict
```

## Supported Languages & Patterns

### JavaScript/TypeScript
```javascript
process.env.API_KEY
process.env['DATABASE_URL']
const key = process.env.SECRET_KEY
```

### Python
```python
os.getenv('API_KEY')
os.environ['DATABASE_URL']
os.environ.get('REDIS_HOST')
```

### Ruby
```ruby
ENV['API_KEY']
ENV.fetch('DATABASE_URL')
```

### Go
```go
os.Getenv("API_KEY")
```

### PHP
```php
getenv('API_KEY')
$_ENV['DATABASE_URL']
$_SERVER['REDIS_HOST']
```

## Advanced Usage

### Ignore Patterns

```bash
# Ignore test files and specific directories
unenv scan --ignore "tests,__tests__,*.test.js,node_modules"
```

### JSON Output

```bash
# Get machine-readable output for scripting
unenv scan --json > env-report.json
```

### Multiple Environment Files

```bash
# Check production environment
unenv check --env .env.production

# Generate for staging
unenv generate --output .env.staging.example
```

### CI/CD Integration

**GitHub Actions:**
```yaml
- name: Validate environment variables
  run: npx unenv check --strict
```

**GitLab CI:**
```yaml
test:env:
  script:
    - npx unenv check --strict
```

## Best Practices

1. **Commit `.env.example`** - Share structure with your team, not secrets
2. **Never commit `.env`** - Add it to `.gitignore`
3. **Run `unenv check` in CI** - Catch missing variables before deployment
4. **Update regularly** - Re-run `unenv generate` after adding features
5. **Review unused variables** - Clean up old config periodically
6. **Use `--strict` in CI/CD** - Fail builds on missing variables

## Security

- `unenv` only reads your code - never modifies `.env` files
- Automatically checks if `.env` is in `.gitignore`
- Highlights sensitive variables (secrets, keys, passwords)
- Never logs or transmits actual environment values
- All processing happens locally

## Example Output

Full `.env.example` generated by `unenv`:

```bash
# Generated by unenv
# Last updated: 2025-02-05T14:30:00.000Z
# 
# This file documents all environment variables used in this project.
# Copy this to .env and fill in the values.

# Database
# ────────────────────────────────────────

# Database connection string (URL format)
# Used in: src/db.js
DATABASE_URL=

# Redis host for caching
# Used in: src/cache.js
REDIS_HOST=

# Redis port (number)
# Used in: src/cache.js
REDIS_PORT=

# Authentication
# ────────────────────────────────────────

# JWT secret key - keep secret! - DO NOT COMMIT!
# Used in: src/auth.js
JWT_SECRET=

# API key for external service - keep secret!
# Used in: src/api.js
API_KEY=

# Application
# ────────────────────────────────────────

# Environment: development | production | test
# Used in: src/config.js
NODE_ENV=

# Application port (number)
# Used in: src/server.js
PORT=

# Enable debug logging (boolean)
# Used in: src/logger.js
DEBUG=
```

## Use Cases

- **Onboarding** - New developers know exactly what variables they need
- **CI/CD** - Validate environment before deployment
- **Documentation** - Always up-to-date variable list
- **Debugging** - Find where variables are used across codebase
- **Cleanup** - Identify unused variables to remove
- **Security audits** - List all sensitive variables

## Common Gotchas & Troubleshooting

### Issue 1: Variables not detected in template strings

**Problem:** Variables in template strings aren't found.

```javascript
// Not detected ❌
const url = `https://${process.env.API_HOST}/api`;

// Detected ✅
const host = process.env.API_HOST;
const url = `https://${host}/api`;
```

**Cause:** Pattern matching doesn't parse JavaScript template literals deeply.

**Workaround:**
```javascript
// Extract to separate line
const API_HOST = process.env.API_HOST;
const url = `https://${API_HOST}/api`;

// Or use explicit property access
const url = `https://${process.env['API_HOST']}/api`;
```

---

### Issue 2: Dynamically constructed variable names

**Problem:** Dynamic variable access isn't detected.

```javascript
// Not detected ❌
const env = 'production';
const dbUrl = process.env[`${env.toUpperCase()}_DATABASE_URL`];

// Detected ✅
const dbUrl = process.env.PRODUCTION_DATABASE_URL;
```

**Cause:** unenv uses static analysis, can't evaluate runtime expressions.

**Solution:** Use explicit variable names or add comments:

```javascript
// UNENV: PRODUCTION_DATABASE_URL, DEVELOPMENT_DATABASE_URL
const env = process.env.NODE_ENV || 'development';
const dbUrl = process.env[`${env.toUpperCase()}_DATABASE_URL`];
```

---

### Issue 3: .env.example out of sync after scan

**Problem:** Scanned variables don't match what was previously in .env.example.

**Cause:** Code changed, .env.example wasn't updated.

**Solution:**

```bash
# Backup existing
cp .env.example .env.example.backup

# Generate fresh version
unenv generate

# Compare
diff .env.example.backup .env.example

# Manually merge custom comments/values
```

**Best practice:** Re-run `unenv generate` after major features or during code reviews.

---

### Issue 4: False positives from comments

**Problem:** Variables in comments are detected as usage.

```javascript
// TODO: Add process.env.NEW_FEATURE_FLAG later
// This isn't actually used yet, but unenv detects it

// Workaround: Use generic terms in comments
// TODO: Add feature flag environment variable later
```

**Limitation:** Pattern matching can't distinguish code from comments perfectly.

---

### Issue 5: Variables defined but never used

**Problem:** `.env` has variables that aren't in code, but unenv doesn't warn.

**Cause:** unenv scans code → env, not env → code.

**Solution:**

```bash
# Use check command to find unused variables
unenv check

Unused Variables (3):
  • OLD_API_KEY
  • LEGACY_DATABASE_URL
  • UNUSED_TOKEN

# Review and remove from .env
```

---

### Issue 6: Multi-repository projects

**Problem:** Monorepo with multiple services, each using different env vars.

**Scenario:**

```
monorepo/
├── services/
│   ├── api/           (uses DATABASE_URL, JWT_SECRET)
│   ├── frontend/      (uses API_ENDPOINT)
│   └── worker/        (uses QUEUE_URL, DATABASE_URL)
└── .env               (shared)
```

**Solution:**

```bash
# Option 1: Scan each service separately
cd services/api
unenv generate --output ../../.env.api.example

cd services/frontend
unenv generate --output ../../.env.frontend.example

# Option 2: Scan entire monorepo
cd monorepo/
unenv scan --dir services/
# Detects all variables across all services

# Option 3: Use service-specific .env files
# Each service has its own .env
services/api/.env
services/frontend/.env
services/worker/.env
```

---

### Issue 7: Secrets leaked in .env.example

**Problem:** Developer accidentally commits real secrets to .env.example.

```bash
# ❌ DANGER - Real secret in .env.example
API_KEY=sk_live_abcd1234...

# ✅ CORRECT - Placeholder
API_KEY=your_api_key_here
```

**Prevention:**

```bash
# Use unenv generate (always creates placeholders)
unenv generate

# Add git pre-commit hook
#!/bin/bash
# .git/hooks/pre-commit

if git diff --cached .env.example | grep -E "sk_live|pk_live|secret_|password=.{8,}"; then
  echo "❌ Possible secret detected in .env.example"
  exit 1
fi
```

**Detection:**

```bash
# Check for suspicious patterns
grep -E "sk_|pk_|[a-zA-Z0-9]{32,}" .env.example

# Review before committing
git diff .env.example
```

---

### Issue 8: Variables in third-party libraries

**Problem:** Scanning detects env vars from node_modules.

```bash
$ unenv scan

Found 127 environment variables
Including:
  • DEBUG (from node_modules/debug/src/index.js)
  • NODE_ENV (from node_modules/express/lib/application.js)
  # ... 100+ more
```

**Solution:**

```bash
# Ignore node_modules (default behavior)
unenv scan --ignore "node_modules,vendor"

# Or be more specific
unenv scan --dir src/
```

---

### Issue 9: Cross-platform path issues (Windows)

**Problem:** Ignore patterns don't work on Windows.

**Cause:** Windows uses `\` instead of `/` for paths.

**Solution:**

```bash
# Use forward slashes (works on all platforms)
unenv scan --ignore "node_modules,dist,build"

# Avoid backslashes
# ❌ --ignore "node_modules\dist"
# ✅ --ignore "node_modules,dist"
```

---

### Issue 10: .env not in .gitignore

**Problem:** `.env` file committed to git with secrets.

**Detection:**

```bash
# Check if .env is tracked
git ls-files | grep "^\.env$"

# If output: .env is tracked ❌
```

**Fix:**

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# Remove from git (keep local file)
git rm --cached .env

# Commit
git commit -m "chore: remove .env from tracking"

# Verify
unenv check  # Should warn if .env not in .gitignore
```

---

### Issue 11: TypeScript/Vite env variables ($VITE_, REACT_APP_, etc.)

**Problem:** Framework-specific prefixes not detected.

**Vite:**
```javascript
// Not detected by default ❌
const apiUrl = import.meta.env.VITE_API_URL;
```

**React (CRA):**
```javascript
// Not detected by default ❌
const key = process.env.REACT_APP_API_KEY;
```

**Current workaround:** unenv detects these if using standard patterns.

**Future improvement:** Add framework-specific detection modes.

---

### Issue 12: Variables in Docker Compose not scanned

**Problem:** docker-compose.yml references env vars not in code.

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}  # Not in app code
```

**Solution:**

```bash
# Manually add to .env.example
echo "# Docker Compose variables" >> .env.example
echo "DB_PASSWORD=" >> .env.example

# Or scan docker-compose.yml separately
grep -oE '\$\{[^}]+\}' docker-compose.yml | tr -d '${}'
```

---

### Issue 13: Check fails in CI but works locally

**Problem:** CI fails with missing variables that work locally.

**Cause:** Different .env files between local and CI.

**Debug:**

```bash
# In CI, print what's detected
unenv scan --json

# Compare with local
unenv scan --json > local-scan.json

# Check diff
diff local-scan.json ci-scan.json
```

**Common causes:**
- `.env.local` exists locally but not in CI
- Git ignored files not in CI
- Different Node.js/Python versions

**Fix:**

```bash
# Use consistent .env.example
cp .env.example .env  # In CI setup

# Or validate against .env.example
unenv check --env .env.example --strict
```

---

### Issue 14: Large codebases: slow scan

**Problem:** Scanning 1000+ files takes too long.

**Solution:**

```bash
# Scan only specific directories
unenv scan --dir src/,lib/

# Ignore test files
unenv scan --ignore "**/*.test.js,**/*.spec.js,tests/"

# Use multiple workers (if implemented)
unenv scan --workers 4
```

**Performance tip:** Add unenv scan to pre-commit hooks, not on every save.

---

### Issue 15: Required vs optional variables

**Problem:** Can't distinguish between required and optional env vars.

```javascript
// Required
const dbUrl = process.env.DATABASE_URL;  // App crashes if missing

// Optional
const debug = process.env.DEBUG || false;  // Has default
```

**Current limitation:** unenv treats all variables as equal.

**Workaround:** Use comments in .env.example:

```bash
# Required variables
DATABASE_URL=

# Optional (has defaults)
DEBUG=false
LOG_LEVEL=info
```

**Future feature:** Detect default values and mark as optional.

---

## Performance Tips

### 1. Scan specific directories

**Slow:**
```bash
unenv scan
# Scans entire project including node_modules, dist, etc.
```

**Fast:**
```bash
unenv scan --dir src/,lib/
# Scans only source code
```

**Impact:** 10x faster for large projects.

---

### 2. Use .unenvignore file

Create `.unenvignore` (similar to .gitignore):

```
# .unenvignore
node_modules/
dist/
build/
coverage/
*.test.js
*.spec.ts
```

**Usage:**
```bash
unenv scan
# Automatically respects .unenvignore
```

---

### 3. Cache scan results

For CI/CD with unchanged code:

```bash
# Generate cache key based on file hashes
HASH=$(find src/ -type f -name "*.js" -exec md5sum {} \; | md5sum | cut -d' ' -f1)

# Check cache
if [ -f "unenv-cache-$HASH.json" ]; then
  echo "Using cached scan results"
  cat "unenv-cache-$HASH.json"
else
  unenv scan --json > "unenv-cache-$HASH.json"
fi
```

---

### 4. Parallelize multi-service scans

**Slow:**
```bash
cd service-1 && unenv scan
cd service-2 && unenv scan
cd service-3 && unenv scan
```

**Fast:**
```bash
# Scan in parallel
(cd service-1 && unenv scan) &
(cd service-2 && unenv scan) &
(cd service-3 && unenv scan) &
wait
```

---

### 5. Use JSON output for parsing

**Inefficient:**
```bash
unenv scan | grep "DATABASE_URL" | awk '{print $2}'
```

**Efficient:**
```bash
unenv scan --json | jq -r '.variables[] | select(.name == "DATABASE_URL")'
```

---

### 6. Incremental scans

**Only scan changed files:**

```bash
# Git hook: pre-commit
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E "\.(js|ts|py)$")

if [ -n "$CHANGED_FILES" ]; then
  unenv scan --files $CHANGED_FILES
fi
```

---

### 7. Reduce scan depth

**If you have consistent patterns:**

```bash
# Only scan top-level files
unenv scan --max-depth 3

# Skip deeply nested directories
```

---

### 8. Batch operations in CI

**Slow:**
```bash
unenv scan
unenv check
unenv generate
```

**Fast:**
```bash
# Combine into single scan operation
unenv verify --generate --check
# (if implemented as single command)
```

---

### 9. Filter by language

**If using multiple languages:**

```bash
# Only scan JavaScript files
unenv scan --lang javascript

# Skip Python files if not using Python
unenv scan --exclude-lang python
```

---

### 10. Watch mode for development

**Continuous scanning during dev:**

```bash
# Watch files and re-scan on changes
unenv watch

# Or use nodemon/chokidar
nodemon --watch src/ --exec "unenv scan"
```

---

## FAQ

### Q1: Does unenv send my environment variables anywhere?

**A:** No. All processing is 100% local. unenv:
- Never sends data to external servers
- Never logs actual variable values
- Only scans your local files
- Open-source - audit the code yourself

---

### Q2: Can unenv detect required vs optional variables?

**A:** Not automatically (yet). Current limitations:
- Treats all `process.env.X` as equally important
- Doesn't detect default values

**Workaround:**

```javascript
// Use comments to mark as optional
const debug = process.env.DEBUG || false; // UNENV:OPTIONAL

// Or in .env.example
# Required
DATABASE_URL=

# Optional (has defaults)
DEBUG=false
```

**Roadmap:** Automatic detection of default values planned for v2.0.

---

### Q3: How do I handle multiple environments (dev/staging/prod)?

**A:** Multiple approaches:

**Option 1: Separate .env files**
```bash
.env.development
.env.staging
.env.production
.env.example  # Template for all

# Validate each
unenv check --env .env.development
unenv check --env .env.staging
unenv check --env .env.production
```

**Option 2: Single .env with environment markers**
```bash
# .env.example
# === Development ===
DEV_DATABASE_URL=
DEV_API_KEY=

# === Production ===
PROD_DATABASE_URL=
PROD_API_KEY=
```

**Option 3: Environment-specific scanning**
```bash
# Scan for production code only
unenv scan --dir src/production/
```

---

### Q4: Can unenv work with monorepos?

**A:** Yes! Several strategies:

**Strategy 1: Root-level .env**
```bash
# Scan entire monorepo
unenv scan --dir packages/

# Generate unified .env.example
unenv generate
```

**Strategy 2: Per-package .env**
```bash
# Each package has own .env
packages/api/.env
packages/frontend/.env

# Scan each separately
cd packages/api && unenv generate
cd packages/frontend && unenv generate
```

**Strategy 3: Shared + local**
```bash
# Root .env for shared vars (DB, Redis)
/.env

# Package-specific vars
/packages/api/.env.local
/packages/frontend/.env.local
```

---

### Q5: Does unenv support Vite/Next.js/React env variables?

**A:** Partially. Works with:

**Standard patterns:**
```javascript
// ✅ Detected
process.env.VITE_API_URL
process.env.REACT_APP_API_KEY
process.env.NEXT_PUBLIC_URL
```

**Framework-specific patterns:**
```javascript
// ⚠️ May not detect
import.meta.env.VITE_API_URL  // Vite
```

**Workaround:**

```javascript
// Extract to variable first
const VITE_API_URL = import.meta.env.VITE_API_URL;
```

**Future:** Framework-specific scanners planned.

---

### Q6: How do I integrate unenv into my CI/CD pipeline?

**A:** Examples for major platforms:

**GitHub Actions:**
```yaml
name: Env Check

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Validate .env configuration
        run: |
          npx unenv check --strict
          npx unenv scan --json > env-report.json
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: env-report
          path: env-report.json
```

**GitLab CI:**
```yaml
env-check:
  stage: validate
  script:
    - npm install -g unenv
    - unenv check --strict
    - unenv generate --output .env.example.new
    - diff .env.example .env.example.new || exit 1
  only:
    - merge_requests
```

**Jenkins:**
```groovy
stage('Env Validation') {
  steps {
    sh 'npx unenv check --strict'
    sh 'npx unenv scan --json > env-report.json'
    archiveArtifacts 'env-report.json'
  }
}
```

---

### Q7: Can unenv integrate with secret managers (AWS Secrets Manager, Vault)?

**A:** Not directly (yet), but you can combine:

**AWS Secrets Manager:**
```bash
# Fetch secrets
aws secretsmanager get-secret-value --secret-id prod/myapp | \
  jq -r '.SecretString' > .env.production

# Validate against code
unenv check --env .env.production
```

**HashiCorp Vault:**
```bash
# Export secrets to .env
vault kv get -format=json secret/myapp | \
  jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > .env

# Scan and compare
unenv check
```

**Future feature:** Direct integration with secret managers planned for v2.0.

---

### Q8: What if I have environment variables in scripts (bash, python scripts)?

**A:** unenv primarily scans application code. For scripts:

**Bash scripts:**
```bash
# Variables like $API_KEY won't be detected automatically

# Workaround: Add comment marker
# UNENV: API_KEY, DATABASE_URL
source .env
```

**Python scripts:**
```python
# These ARE detected ✅
import os
api_key = os.getenv('API_KEY')
db_url = os.environ['DATABASE_URL']
```

---

### Q9: How do I exclude test-only environment variables?

**A:** Use ignore patterns:

```bash
# Exclude test files
unenv scan --ignore "**/*.test.js,**/*.spec.ts,tests/"

# Or create .unenvignore
echo "**/*.test.js" >> .unenvignore
echo "tests/" >> .unenvignore
```

**Alternatively, separate test vars:**

```bash
# .env.example - production vars only
DATABASE_URL=
API_KEY=

# .env.test.example - test-specific
TEST_DATABASE_URL=
MOCK_API_KEY=
```

---

### Q10: Can unenv fix my .env automatically?

**A:** Partially, with `--fix`:

```bash
unenv check --fix

# What it does:
# ✅ Adds missing variables (as empty)
# ✅ Adds comments/categorization
# ❌ Doesn't remove unused variables (safety)
# ❌ Doesn't fill in values (security)
```

**After auto-fix:**
```bash
# .env (updated)
DATABASE_URL=  # ← Added, needs value
API_KEY=       # ← Added, needs value

# Existing vars untouched
NODE_ENV=development
```

**Manual review still required** for values and removing unused vars.

---

## Roadmap

### v1.1.0 (Next Release)
- [ ] Framework-specific scanners (Vite, Next.js, React Native)
- [ ] `.unenvignore` file support
- [ ] Better TypeScript support (`import.meta.env`, typed variables)
- [ ] Parallel scanning for monorepos
- [ ] Required vs optional variable detection

### v1.2.0
- [ ] Secret manager integration (AWS, Vault, Azure KeyVault)
- [ ] Watch mode for continuous validation
- [ ] Web dashboard for visualization
- [ ] Docker Compose .yml scanning
- [ ] Kubernetes ConfigMap/Secret generation

### v2.0.0
- [ ] AST-based parsing (100% accuracy)
- [ ] Variable dependency graph
- [ ] Auto-fix suggestions (with AI?)
- [ ] Multi-language support (Java, C#, Rust)
- [ ] Team collaboration features

### Future Ideas
- [ ] Generate from OpenAPI/Swagger specs
- [ ] Integration with Terraform/Pulumi
- [ ] Environment diff tool (compare dev/staging/prod)
- [ ] Slack/Discord notifications for env changes
- [ ] VS Code extension

**Vote on features:** [GitHub Discussions](https://github.com/muinmomin/unenv/discussions)

---

## Development

```bash
# Clone repo
git clone https://github.com/muinmomin/unenv.git
cd unenv

# Install dependencies
npm install

# Link locally
npm link

# Test on a project
cd /path/to/your/project
unenv scan

# Run tests
npm test

# Build
npm run build

# Publish (maintainers only)
npm publish
```

## Contributing

Contributions welcome!

**Ideas for improvement:**
- Support more languages (Rust, Java, C#, etc.)
- Detect required vs optional variables
- Integration with secret managers (AWS Secrets Manager, Vault, etc.)
- Web UI for visualization
- Auto-generate from OpenAPI specs
- Support for nested .env files

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/rust-support`)
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

Please include:
- Example code patterns you're adding support for
- Test cases for new features
- Documentation updates

### Development Guidelines

**Adding new language support:**

1. Add pattern to `src/scanners/`:
```javascript
// src/scanners/rust.js
export const rustPatterns = [
  /std::env::var\("([^"]+)"\)/g,
  /env::var_os\("([^"]+)"\)/g,
];
```

2. Add tests:
```javascript
// tests/rust.test.js
test('detects Rust env::var', () => {
  const code = 'let key = std::env::var("API_KEY").unwrap();';
  const vars = scan(code, { lang: 'rust' });
  expect(vars).toContain('API_KEY');
});
```

3. Update docs

**Adding new features:**

1. Open an issue first to discuss
2. Write tests before implementation (TDD)
3. Update README with examples
4. Ensure backward compatibility

---

## Limitations

- Detects variables by pattern matching (not full AST parsing)
- May miss dynamically constructed variable names
- Doesn't validate variable formats or types
- No support for variable substitution/interpolation
- Template literals with env vars may not be detected
- Framework-specific patterns (import.meta.env) limited support

**For 100% accuracy:** Manual review of .env.example is still recommended.

---

## License

MIT © [muin](https://github.com/muinmomin)

## Related Tools

- **dotenv** - Load .env files into process.env
- **env-cmd** - Execute commands with .env variables
- **cross-env** - Cross-platform environment variable setting
- **envalid** - Environment variable validation
- **dotenv-safe** - Enforce .env.example structure

## Support

- 🐛 [Report bugs](https://github.com/muinmomin/unenv/issues)
- 💡 [Request features](https://github.com/muinmomin/unenv/discussions)
- 📧 Email: support@muin.company
- 💬 [Community Discord](https://discord.gg/muin) (coming soon)

---

Made with ❤️ by [muin](https://github.com/muinmomin)

*Stop maintaining .env.example by hand. Automate it.*

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

## Limitations

- Detects variables by pattern matching (not full AST parsing)
- May miss dynamically constructed variable names
- Doesn't validate variable formats or types
- No support for variable substitution/interpolation

## Roadmap

- [ ] AST-based parsing for better accuracy
- [ ] Support for .env.local, .env.test, etc.
- [ ] Integration with Docker Compose
- [ ] Variable dependency tracking
- [ ] Required vs optional variable detection
- [ ] Web dashboard for visualization

## License

MIT

---

Made by [muin](https://github.com/muinmomin)

*Stop maintaining .env.example by hand. Automate it.*

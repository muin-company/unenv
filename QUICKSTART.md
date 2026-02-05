# Quick Start Guide

Get up and running with `unenv` in 2 minutes.

## Installation

```bash
npm install -g unenv
```

## Your First Scan

Navigate to your project:

```bash
cd your-project
unenv scan
```

You'll see:
- ✓ How many files were analyzed
- ✓ What environment variables were found
- ❌ Which ones are missing from your `.env`

## Generate .env.example

Create a documented template:

```bash
unenv generate
```

This creates `.env.example` with:
- All detected variables
- Smart categorization (Database, Auth, API, etc.)
- Helpful comments for each variable
- Usage locations

## Validate Your Config

Check if everything is set up correctly:

```bash
unenv check
```

You'll get:
- ✓ Summary of configured vs missing variables
- ❌ Missing variables that need attention
- ⚠️ Unused variables in your `.env`
- 💡 Recommendations

## Use in CI/CD

Fail builds if config is incomplete:

```bash
unenv check --strict
```

Add to your `.github/workflows/ci.yml`:

```yaml
- name: Check environment variables
  run: unenv check --strict
```

## Pro Tips

### Verbose Output
```bash
unenv scan -v
```

### JSON Output
```bash
unenv scan --json > env-report.json
```

### Custom Directory
```bash
unenv scan -d ./src
```

### Ignore Patterns
```bash
unenv scan --ignore "tests,*.test.js"
```

### Different .env Files
```bash
unenv check --env .env.production
unenv generate --output .env.staging.example
```

## Common Workflow

```bash
# 1. Scan your project
unenv scan

# 2. Generate template
unenv generate

# 3. Copy and fill in values
cp .env.example .env
# Edit .env with your actual values

# 4. Verify everything is set
unenv check

# 5. Add to .gitignore
echo ".env" >> .gitignore

# 6. Commit .env.example
git add .env.example
git commit -m "Add environment configuration"
```

## Team Onboarding

New developer joins your team:

```bash
# 1. Clone repo
git clone your-repo

# 2. Create .env from example
cp .env.example .env

# 3. Fill in values (get from team lead)
# Edit .env

# 4. Verify
unenv check
```

Done! They have exactly what they need.

## Troubleshooting

### "No environment variables found"

Your code might use a different pattern. Check supported languages in README.

### ".env is not in .gitignore"

Add it immediately:
```bash
echo ".env" >> .gitignore
```

### "Missing variables"

Add them to your `.env` file. Use the generated `.env.example` as a template.

### Unused variables

These are in `.env` but not used in code. Could be:
- Leftover from old code
- Used at runtime
- Configuration that loads dynamically

Review and remove if not needed.

## Next Steps

- Read the [full README](README.md) for all features
- Check out [examples](examples/) to see it in action
- [Contribute](CONTRIBUTING.md) new language support

---

Questions? Open an issue!

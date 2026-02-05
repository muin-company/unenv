# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-15

### Added
- Initial release of unenv
- `scan` command - Detect environment variables in codebase
- `generate` command - Create .env.example with smart categorization
- `check` command - Validate environment configuration
- Multi-language support: JavaScript, TypeScript, Python, Ruby, Go, PHP
- Smart categorization (Database, Auth, API, Cloud, etc.)
- Usage tracking with file:line locations
- .gitignore safety checks
- Beautiful CLI output with colors and spinners
- JSON output mode for automation
- Comprehensive test suite
- Example projects for testing

### Features
- Auto-detection of env vars from code
- Deduplication and location tracking
- Category-based organization
- Missing/unused variable detection
- Strict mode for CI/CD
- Custom ignore patterns
- Multiple .env file support

### Developer Experience
- Fast scanning with fast-glob
- Clear error messages
- Helpful recommendations
- Verbose mode for debugging
- Extensive documentation

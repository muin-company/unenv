# Example Projects

Test `unenv` on these example projects:

## Node.js/Express Example

```bash
cd examples/node-express
unenv scan
unenv generate
unenv check
```

Expected output:
- 12 environment variables detected
- Categorized into: Database, Authentication, API & Services, etc.

## Python/Flask Example

```bash
cd examples/python-flask
unenv scan
unenv generate
```

Expected output:
- 8 environment variables detected
- Multi-language detection working

## Testing

Use these examples to verify:
- ✅ Variable detection across languages
- ✅ Line number tracking
- ✅ Category assignment
- ✅ .env.example generation
- ✅ Missing variable warnings

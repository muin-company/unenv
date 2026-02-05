# Contributing to unenv

Thanks for your interest in contributing! 🎉

## Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/unenv.git
cd unenv

# Install dependencies
npm install

# Link for local testing
npm link

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
unenv/
├── bin/
│   └── unenv.js          # CLI entry point
├── src/
│   ├── scanner.js        # Core scanning logic
│   ├── commands/
│   │   ├── scan.js       # Scan command
│   │   ├── generate.js   # Generate command
│   │   └── check.js      # Check command
│   └── index.js          # Main exports
├── __tests__/
│   └── scanner.test.js   # Test suite
└── examples/             # Example projects
```

## Adding Language Support

To add support for a new language:

1. **Add patterns to `src/scanner.js`:**

```javascript
const PATTERNS = {
  // ... existing patterns
  
  // New language
  'rust': [
    /std::env::var\("([A-Z_][A-Z0-9_]*)"\)/g,
  ],
};
```

2. **Add file extensions:**

```javascript
const EXTENSIONS = {
  // ... existing extensions
  '.rs': 'rust',
};
```

3. **Add tests in `__tests__/scanner.test.js`:**

```javascript
test('detects Rust env::var variables', () => {
  const file = path.join(tempDir, 'test.rs');
  fs.writeFileSync(file, `
    let key = std::env::var("API_KEY").unwrap();
  `);
  
  const vars = scanFile(file);
  expect(vars[0].name).toBe('API_KEY');
});
```

4. **Update README with examples**

5. **Create example project in `examples/`**

## Testing

Run tests:

```bash
# All tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch

# Specific file
npm test scanner.test.js
```

Test on example projects:

```bash
cd examples/node-express
unenv scan
unenv generate
unenv check
```

## Code Style

- Use ES6+ features
- Follow existing patterns
- Add JSDoc comments for functions
- Keep functions small and focused
- Run `npm run lint` before committing

## Pull Request Process

1. **Create a branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes:**
   - Write code
   - Add tests
   - Update documentation

3. **Test thoroughly:**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit with clear messages:**
   ```bash
   git commit -m "Add: Support for Rust environment variables"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/my-new-feature
   ```

6. **Describe your changes:**
   - What problem does it solve?
   - How did you test it?
   - Any breaking changes?

## Feature Ideas

Want to contribute but don't know where to start? Here are some ideas:

- [ ] Add more language support (Rust, Java, C#, etc.)
- [ ] Interactive mode for setting up .env
- [ ] Detect .env files in subdirectories
- [ ] Support for .env.schema validation
- [ ] Integration with CI/CD platforms
- [ ] VSCode extension
- [ ] Better categorization with AI/ML
- [ ] Support for .env encryption
- [ ] Web UI for managing env vars
- [ ] Export to different formats (YAML, JSON, etc.)

## Questions?

Open an issue or reach out! We're friendly. 😊

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

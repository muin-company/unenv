const fs = require('fs');
const path = require('path');
const os = require('os');
const { scanFile, scanDirectory, parseEnvFile, categorizeVariable } = require('../src/scanner');

describe('Scanner', () => {
  let tempDir;
  
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unenv-test-'));
  });
  
  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
  
  describe('scanFile', () => {
    test('detects JavaScript process.env variables', () => {
      const file = path.join(tempDir, 'test.js');
      fs.writeFileSync(file, `
        const url = process.env.DATABASE_URL;
        const key = process.env["API_KEY"];
      `);
      
      const vars = scanFile(file);
      
      expect(vars.length).toBe(2);
      expect(vars.map(v => v.name)).toContain('DATABASE_URL');
      expect(vars.map(v => v.name)).toContain('API_KEY');
    });
    
    test('detects Python os.getenv variables', () => {
      const file = path.join(tempDir, 'test.py');
      fs.writeFileSync(file, `
        import os
        url = os.getenv('DATABASE_URL')
        key = os.environ['API_KEY']
        host = os.environ.get('REDIS_HOST')
      `);
      
      const vars = scanFile(file);
      
      expect(vars.length).toBe(3);
      expect(vars.map(v => v.name)).toContain('DATABASE_URL');
      expect(vars.map(v => v.name)).toContain('API_KEY');
      expect(vars.map(v => v.name)).toContain('REDIS_HOST');
    });
    
    test('detects Ruby ENV variables', () => {
      const file = path.join(tempDir, 'test.rb');
      fs.writeFileSync(file, `
        url = ENV['DATABASE_URL']
        key = ENV.fetch('API_KEY')
      `);
      
      const vars = scanFile(file);
      
      expect(vars.length).toBe(2);
      expect(vars.map(v => v.name)).toContain('DATABASE_URL');
      expect(vars.map(v => v.name)).toContain('API_KEY');
    });
    
    test('detects Go os.Getenv variables', () => {
      const file = path.join(tempDir, 'test.go');
      fs.writeFileSync(file, `
        package main
        import "os"
        
        func main() {
          url := os.Getenv("DATABASE_URL")
        }
      `);
      
      const vars = scanFile(file);
      
      expect(vars.length).toBe(1);
      expect(vars[0].name).toBe('DATABASE_URL');
    });
    
    test('tracks line numbers correctly', () => {
      const file = path.join(tempDir, 'test.js');
      fs.writeFileSync(file, `line 1
line 2
const url = process.env.DATABASE_URL;
line 4
const key = process.env.API_KEY;
`);
      
      const vars = scanFile(file);
      
      const dbVar = vars.find(v => v.name === 'DATABASE_URL');
      const apiVar = vars.find(v => v.name === 'API_KEY');
      
      expect(dbVar.line).toBe(3);
      expect(apiVar.line).toBe(5);
    });
    
    test('ignores non-matching files', () => {
      const file = path.join(tempDir, 'test.txt');
      fs.writeFileSync(file, 'process.env.DATABASE_URL');
      
      const vars = scanFile(file);
      
      expect(vars).toEqual([]);
    });
  });
  
  describe('scanDirectory', () => {
    test('scans multiple files', async () => {
      fs.writeFileSync(path.join(tempDir, 'app.js'), 'process.env.PORT');
      fs.writeFileSync(path.join(tempDir, 'db.js'), 'process.env.DATABASE_URL');
      
      const result = await scanDirectory(tempDir);
      
      expect(result.variables.length).toBe(2);
      expect(result.totalFiles).toBeGreaterThanOrEqual(2);
    });
    
    test('deduplicates variables', async () => {
      fs.writeFileSync(path.join(tempDir, 'file1.js'), 'process.env.PORT');
      fs.writeFileSync(path.join(tempDir, 'file2.js'), 'process.env.PORT');
      
      const result = await scanDirectory(tempDir);
      
      expect(result.variables.length).toBe(1);
      expect(result.variables[0].locations.length).toBe(2);
    });
    
    test('ignores node_modules by default', async () => {
      fs.mkdirSync(path.join(tempDir, 'node_modules'));
      fs.writeFileSync(path.join(tempDir, 'node_modules', 'lib.js'), 'process.env.SOMETHING');
      fs.writeFileSync(path.join(tempDir, 'app.js'), 'process.env.PORT');
      
      const result = await scanDirectory(tempDir);
      
      expect(result.variables.map(v => v.name)).not.toContain('SOMETHING');
      expect(result.variables.map(v => v.name)).toContain('PORT');
    });
    
    test('respects custom ignore patterns', async () => {
      fs.mkdirSync(path.join(tempDir, 'custom'));
      fs.writeFileSync(path.join(tempDir, 'custom', 'ignore.js'), 'process.env.IGNORED');
      fs.writeFileSync(path.join(tempDir, 'app.js'), 'process.env.PORT');
      
      const result = await scanDirectory(tempDir, ['custom']);
      
      expect(result.variables.map(v => v.name)).not.toContain('IGNORED');
    });
  });
  
  describe('parseEnvFile', () => {
    test('parses valid .env file', () => {
      const envFile = path.join(tempDir, '.env');
      fs.writeFileSync(envFile, `
# Comment
DATABASE_URL=postgres://localhost
API_KEY=secret123

# Another comment
PORT=3000
`);
      
      const vars = parseEnvFile(envFile);
      
      expect(vars.has('DATABASE_URL')).toBe(true);
      expect(vars.has('API_KEY')).toBe(true);
      expect(vars.has('PORT')).toBe(true);
      expect(vars.size).toBe(3);
    });
    
    test('handles missing file', () => {
      const vars = parseEnvFile(path.join(tempDir, 'nonexistent.env'));
      
      expect(vars.size).toBe(0);
    });
    
    test('ignores comments and empty lines', () => {
      const envFile = path.join(tempDir, '.env');
      fs.writeFileSync(envFile, `
# This is a comment

PORT=3000
# Another comment
`);
      
      const vars = parseEnvFile(envFile);
      
      expect(vars.size).toBe(1);
      expect(vars.has('PORT')).toBe(true);
    });
  });
  
  describe('categorizeVariable', () => {
    test('categorizes database variables', () => {
      expect(categorizeVariable('DATABASE_URL')).toBe('Database');
      expect(categorizeVariable('POSTGRES_HOST')).toBe('Database');
      expect(categorizeVariable('REDIS_PORT')).toBe('Database');
    });
    
    test('categorizes authentication variables', () => {
      expect(categorizeVariable('JWT_SECRET')).toBe('Authentication');
      expect(categorizeVariable('API_KEY')).toBe('Authentication');
      expect(categorizeVariable('AUTH_TOKEN')).toBe('Authentication');
    });
    
    test('categorizes API variables', () => {
      expect(categorizeVariable('API_URL')).toBe('API & Services');
      expect(categorizeVariable('SERVICE_ENDPOINT')).toBe('API & Services');
    });
    
    test('categorizes cloud variables', () => {
      expect(categorizeVariable('AWS_REGION')).toBe('Cloud & Infrastructure');
      expect(categorizeVariable('S3_BUCKET')).toBe('Cloud & Infrastructure');
    });
    
    test('categorizes application variables', () => {
      expect(categorizeVariable('NODE_ENV')).toBe('Application');
      expect(categorizeVariable('PORT')).toBe('Application');
      expect(categorizeVariable('DEBUG')).toBe('Application');
    });
    
    test('categorizes uncategorized as Other', () => {
      expect(categorizeVariable('RANDOM_VAR')).toBe('Other');
      expect(categorizeVariable('CUSTOM_SETTING')).toBe('Other');
    });
  });
});

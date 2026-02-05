const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

/**
 * Language-specific patterns for detecting environment variables
 */
const PATTERNS = {
  // Node.js: process.env.VAR_NAME
  javascript: [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
  ],
  
  // Python: os.getenv('VAR_NAME'), os.environ['VAR_NAME'], os.environ.get('VAR_NAME')
  python: [
    /os\.getenv\(['"]([ A-Z_][A-Z0-9_]*)['"]/g,
    /os\.environ\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
    /os\.environ\.get\(['"]([A-Z_][A-Z0-9_]*)['"]/g,
  ],
  
  // Ruby: ENV['VAR_NAME'], ENV.fetch('VAR_NAME')
  ruby: [
    /ENV\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
    /ENV\.fetch\(['"]([A-Z_][A-Z0-9_]*)['"]/g,
  ],
  
  // Go: os.Getenv("VAR_NAME")
  go: [
    /os\.Getenv\("([A-Z_][A-Z0-9_]*)"\)/g,
  ],
  
  // PHP: getenv('VAR_NAME'), $_ENV['VAR_NAME'], $_SERVER['VAR_NAME']
  php: [
    /getenv\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
    /\$_ENV\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
    /\$_SERVER\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
  ],
};

/**
 * File extensions mapped to language patterns
 */
const EXTENSIONS = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'javascript',
  '.tsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.php': 'php',
};

/**
 * Smart categorization based on variable name patterns
 * Order matters - categories are checked in order, first match wins
 */
const CATEGORIES = {
  'Authentication': ['AUTH', 'TOKEN', 'SECRET', 'KEY', 'PASSWORD', 'JWT', 'SESSION'],
  'Database': ['DB', 'DATABASE', 'POSTGRES', 'MYSQL', 'MONGO', 'REDIS', 'SQL'],
  'Payment': ['STRIPE', 'PAYMENT', 'PAYPAL'],
  'Email & Communication': ['MAIL', 'SMTP', 'EMAIL', 'SENDGRID', 'TWILIO'],
  'Cloud & Infrastructure': ['AWS', 'GCP', 'AZURE', 'CLOUD', 'S3', 'BUCKET'],
  'API & Services': ['API', 'SERVICE', 'ENDPOINT', 'URL', 'URI'],
  'Application': ['APP', 'NODE_ENV', 'PORT', 'HOST', 'DEBUG', 'LOG'],
};

/**
 * Categorize a variable name
 */
function categorizeVariable(varName) {
  const upper = varName.toUpperCase();
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(keyword => upper.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}

/**
 * Scan a single file for environment variables
 */
function scanFile(filePath) {
  const ext = path.extname(filePath);
  const language = EXTENSIONS[ext];
  
  if (!language) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const patterns = PATTERNS[language];
  const found = [];
  const lines = content.split('\n');
  
  patterns.forEach(pattern => {
    let match;
    const globalPattern = new RegExp(pattern.source, pattern.flags);
    
    while ((match = globalPattern.exec(content)) !== null) {
      const varName = match[1];
      
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      found.push({
        name: varName,
        file: filePath,
        line: lineNumber,
        category: categorizeVariable(varName),
      });
    }
  });
  
  return found;
}

/**
 * Scan directory for all environment variables
 */
async function scanDirectory(dir, ignorePatterns = []) {
  const defaultIgnore = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/vendor/**',
    '**/.next/**',
    '**/coverage/**',
  ];
  
  const ignore = [...defaultIgnore, ...ignorePatterns.map(p => `**/${p}/**`)];
  
  const files = await fg(['**/*'], {
    cwd: dir,
    absolute: true,
    ignore,
    onlyFiles: true,
  });
  
  const allVars = [];
  const varMap = new Map();
  
  for (const file of files) {
    const vars = scanFile(file);
    allVars.push(...vars);
    
    // Deduplicate and track locations
    vars.forEach(v => {
      if (!varMap.has(v.name)) {
        varMap.set(v.name, {
          name: v.name,
          category: v.category,
          locations: [],
        });
      }
      
      varMap.get(v.name).locations.push({
        file: path.relative(dir, v.file),
        line: v.line,
      });
    });
  }
  
  return {
    variables: Array.from(varMap.values()),
    totalFiles: files.length,
    totalOccurrences: allVars.length,
  };
}

/**
 * Parse existing .env file
 */
function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return new Map();
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  const vars = new Map();
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }
    
    // Parse KEY=VALUE
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      vars.set(match[1], true);
    }
  });
  
  return vars;
}

module.exports = {
  scanDirectory,
  scanFile,
  parseEnvFile,
  categorizeVariable,
  CATEGORIES,
};

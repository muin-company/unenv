/**
 * unenv - AI-powered .env file manager
 * 
 * Main exports for programmatic usage
 */

const { scanDirectory, scanFile, parseEnvFile, categorizeVariable } = require('./scanner');
const { scan } = require('./commands/scan');
const { generate } = require('./commands/generate');
const { check } = require('./commands/check');

module.exports = {
  // Core functions
  scanDirectory,
  scanFile,
  parseEnvFile,
  categorizeVariable,
  
  // Commands
  scan,
  generate,
  check,
};

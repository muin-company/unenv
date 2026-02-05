#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');
const { scan } = require('../src/commands/scan');
const { generate } = require('../src/commands/generate');
const { check } = require('../src/commands/check');

program
  .name('unenv')
  .description('AI-powered .env file manager')
  .version(pkg.version);

program
  .command('scan')
  .description('Scan codebase for environment variables')
  .option('-d, --dir <directory>', 'Directory to scan', process.cwd())
  .option('-i, --ignore <patterns>', 'Comma-separated ignore patterns', 'node_modules,dist,build,.git')
  .option('--json', 'Output as JSON')
  .option('-v, --verbose', 'Show detailed output')
  .action(scan);

program
  .command('generate')
  .description('Generate .env.example from detected variables')
  .option('-d, --dir <directory>', 'Directory to scan', process.cwd())
  .option('-o, --output <file>', 'Output file', '.env.example')
  .option('-i, --ignore <patterns>', 'Comma-separated ignore patterns', 'node_modules,dist,build,.git')
  .option('--categorize', 'Group variables by category', true)
  .option('--no-categorize', 'Do not group variables')
  .action(generate);

program
  .command('check')
  .description('Check for missing or unused environment variables')
  .option('-d, --dir <directory>', 'Directory to scan', process.cwd())
  .option('-e, --env <file>', 'Env file to check', '.env')
  .option('-i, --ignore <patterns>', 'Comma-separated ignore patterns', 'node_modules,dist,build,.git')
  .option('--strict', 'Exit with error if issues found')
  .action(check);

program.parse();

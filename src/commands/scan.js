const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const { scanDirectory, parseEnvFile } = require('../scanner');

async function scan(options) {
  const dir = path.resolve(options.dir);
  const spinner = ora('Scanning codebase...').start();
  
  try {
    const ignorePatterns = options.ignore ? options.ignore.split(',') : [];
    const result = await scanDirectory(dir, ignorePatterns);
    
    spinner.succeed(`Analyzed ${chalk.bold(result.totalFiles)} files`);
    
    if (result.variables.length === 0) {
      console.log(chalk.yellow('\n⚠ No environment variables found'));
      return;
    }
    
    console.log(chalk.green(`✓ Found ${chalk.bold(result.variables.length)} unique environment variables`));
    console.log(chalk.dim(`  (${result.totalOccurrences} total occurrences)\n`));
    
    // Check against existing .env
    const envPath = path.join(dir, '.env');
    const existingVars = parseEnvFile(envPath);
    
    const missing = result.variables.filter(v => !existingVars.has(v.name));
    const existing = result.variables.filter(v => existingVars.has(v.name));
    
    if (options.json) {
      console.log(JSON.stringify({
        total: result.variables.length,
        missing: missing.length,
        existing: existing.length,
        variables: result.variables,
      }, null, 2));
      return;
    }
    
    // Display missing variables
    if (missing.length > 0) {
      console.log(chalk.red.bold(`Missing from .env (${missing.length}):`));
      
      missing.forEach(v => {
        console.log(chalk.red(`  • ${chalk.bold(v.name)}`));
        
        if (options.verbose) {
          console.log(chalk.dim(`    Category: ${v.category}`));
          v.locations.forEach(loc => {
            console.log(chalk.dim(`    Used in ${loc.file}:${loc.line}`));
          });
        } else {
          const firstLoc = v.locations[0];
          console.log(chalk.dim(`    Used in ${firstLoc.file}:${firstLoc.line}`));
          if (v.locations.length > 1) {
            console.log(chalk.dim(`    +${v.locations.length - 1} more location(s)`));
          }
        }
      });
      console.log('');
    }
    
    // Display existing variables
    if (existing.length > 0) {
      console.log(chalk.green.bold(`✓ Found in .env (${existing.length}):`));
      
      if (options.verbose) {
        existing.forEach(v => {
          console.log(chalk.green(`  • ${v.name}`));
          console.log(chalk.dim(`    Category: ${v.category}`));
          v.locations.forEach(loc => {
            console.log(chalk.dim(`    Used in ${loc.file}:${loc.line}`));
          });
        });
      } else {
        // Show compact list
        const names = existing.map(v => v.name).join(', ');
        console.log(chalk.dim(`  ${names}\n`));
      }
    }
    
    // Recommendations
    if (missing.length > 0) {
      console.log(chalk.cyan('💡 Recommendations:'));
      console.log(chalk.cyan(`  • Run ${chalk.bold('unenv generate')} to create .env.example`));
      console.log(chalk.cyan(`  • Add missing variables to your .env file`));
      console.log(chalk.cyan(`  • Use ${chalk.bold('unenv check')} to validate configuration\n`));
    }
    
  } catch (error) {
    spinner.fail('Scan failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

module.exports = { scan };

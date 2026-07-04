#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import path from 'path';
import { initCommand } from './commands/init.js';
import { generateCommand } from './commands/generate.js';
import { doctorCommand } from './commands/doctor.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const program = new Command();

  let packageVersion = '0.1.0';
  try {
    const packageJson = await fs.readJson(path.resolve(__dirname, '../package.json'));
    packageVersion = packageJson.version;
  } catch {
    // Fallback if local reading fails in some run configurations
  }

  program
    .name('actionforge')
    .description('CLI to generate professional GitHub Actions workflows automatically')
    .version(packageVersion, '-v, --version', 'output the current version');

  program
    .command('init')
    .description('Initialize GitHub Actions workflow interactively')
    .action(async () => {
      try {
        await initCommand();
      } catch (err: any) {
        logger.error(err.message || err);
        process.exit(1);
      }
    });

  program
    .command('generate')
    .description('Generate GitHub Actions workflow non-interactively with custom overrides')
    .option(
      '-f, --framework <framework>',
      'Target framework (adonis, nest, next, express, fastify, node)'
    )
    .option('-p, --pm <packageManager>', 'Package manager (npm, pnpm, yarn, bun)')
    .option('-n, --node <version>', 'Node version')
    .option('--no-lint', 'Exclude Lint script check')
    .option('--no-typecheck', 'Exclude Type Check script check')
    .option('--no-test', 'Exclude Test script check')
    .option('--no-build', 'Exclude Build script check')
    .option('--telegram', 'Enable Telegram notifications for CI build status')
    .option('--deploy', 'Generate PM2 ecosystem config and CD deploy workflow')
    .option('--app-name <name>', 'Application name for PM2 config')
    .option('--deploy-path <path>', 'Deployment folder path on remote server')
    .option('--script-path <path>', 'Script entrypoint relative to release root')
    .option('--port <port>', 'Application execution port')
    .action(async (options) => {
      try {
        await generateCommand(options);
      } catch (err: any) {
        logger.error(err.message || err);
        process.exit(1);
      }
    });

  program
    .command('doctor')
    .description('Diagnose current project configuration for CI/CD compatibility')
    .action(async () => {
      try {
        await doctorCommand();
      } catch (err: any) {
        logger.error(err.message || err);
        process.exit(1);
      }
    });

  // Make sure if no arguments are passed, it defaults to showing help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
  }

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  logger.error(err.message || err);
  process.exit(1);
});

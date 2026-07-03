import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import { runAllDetectors } from '../detectors/index.js';
import { generateGitHubWorkflow } from '../generators/github.js';
import { logger } from '../utils/logger.js';
import type { DetectionResult, Framework, PackageManager } from '../types/index.js';

export async function initCommand(): Promise<void> {
  const projectDir = process.cwd();

  const detectSpinner = ora('Detecting project configuration...').start();
  let detection: DetectionResult;
  try {
    detection = await runAllDetectors(projectDir);
    detectSpinner.succeed('Project configuration detected!');
  } catch (err: any) {
    detectSpinner.fail('Failed to detect project configuration.');
    logger.error(err.message || err);
    process.exit(1);
  }

  logger.info(`Detected Framework: ${detection.framework}`);
  logger.info(`Detected Package Manager: ${detection.packageManager}`);
  logger.info(`Detected Node Version: ${detection.nodeVersion}`);
  console.log(''); // empty line

  // Prompts
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Confirm or select your project framework:',
      choices: [
        { name: 'AdonisJS', value: 'adonis' },
        { name: 'NestJS', value: 'nest' },
        { name: 'Next.js', value: 'next' },
        { name: 'Express', value: 'express' },
        { name: 'Fastify', value: 'fastify' },
        { name: 'Node.js (Generic)', value: 'node' },
      ],
      default: detection.framework,
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Confirm or select your package manager:',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'bun', value: 'bun' },
      ],
      default: detection.packageManager,
    },
    {
      type: 'input',
      name: 'nodeVersion',
      message: 'Confirm or specify Node.js version:',
      default: detection.nodeVersion,
      validate: (input: string) => {
        if (!input.trim()) return 'Node version cannot be empty';
        return true;
      },
    },
    {
      type: 'checkbox',
      name: 'checks',
      message: 'Select pipeline steps to include in CI:',
      choices: [
        { name: 'Lint', value: 'lint', checked: detection.hasLintScript },
        { name: 'Type Check (TypeScript)', value: 'typecheck', checked: detection.hasTsConfig },
        { name: 'Run Tests', value: 'test', checked: detection.hasTests },
        { name: 'Build Project', value: 'build', checked: detection.hasBuildScript },
      ],
    },
  ]);

  const customizedDetection: DetectionResult = {
    framework: answers.framework as Framework,
    packageManager: answers.packageManager as PackageManager,
    nodeVersion: answers.nodeVersion.trim(),
    hasLockfile: detection.hasLockfile,
    hasTsConfig: (answers.checks as string[]).includes('typecheck'),
    hasTests: (answers.checks as string[]).includes('test'),
    hasLintScript: (answers.checks as string[]).includes('lint'),
    hasBuildScript: (answers.checks as string[]).includes('build'),
  };

  const genSpinner = ora('Generating GitHub Actions CI workflow...').start();
  try {
    const outputPath = await generateGitHubWorkflow(projectDir, customizedDetection);
    genSpinner.succeed('GitHub Actions workflow generated successfully!');
    logger.success(`Created workflow file at: ${path.relative(projectDir, outputPath)}`);
  } catch (err: any) {
    genSpinner.fail('Failed to generate workflow.');
    logger.error(err.message || err);
    process.exit(1);
  }
}

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
      type: 'select',
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
      type: 'select',
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
    {
      type: 'confirm',
      name: 'telegramNotifications',
      message: 'Would you like to enable Telegram notifications for CI build success/failure?',
      default: false,
    },
    {
      type: 'select',
      name: 'runner',
      message: 'Select runner type for workflow execution:',
      choices: [
        { name: 'GitHub-hosted (ubuntu-latest)', value: 'github' },
        { name: 'Self-hosted (your own machine/server)', value: 'self-hosted' },
      ],
      default: 'github',
    },
    {
      type: 'confirm',
      name: 'generateDeploy',
      message: 'Would you like to configure a PM2 deployment and CD workflow?',
      default: false,
    },
    {
      type: 'input',
      name: 'appName',
      message: 'What is your application name (for PM2)?',
      default: path.basename(projectDir),
      when: (answers: any) => answers.generateDeploy,
    },
    {
      type: 'input',
      name: 'deployPath',
      message: 'What is the deployment path on the remote server?',
      default: '/home/ubuntu/apps',
      when: (answers: any) => answers.generateDeploy,
    },
    {
      type: 'input',
      name: 'scriptPath',
      message: 'What is the server entrypoint path (relative to release root)?',
      default: (answers: any) => {
        const fw = answers.framework;
        if (fw === 'adonis') return 'bin/server.js';
        if (fw === 'nest') return 'dist/main.js';
        return 'dist/index.js';
      },
      when: (answers: any) => answers.generateDeploy,
    },
    {
      type: 'input',
      name: 'port',
      message: 'What port should the application listen on?',
      default: (answers: any) => {
        return answers.framework === 'adonis' ? '3333' : '3000';
      },
      when: (answers: any) => answers.generateDeploy,
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
    telegramNotifications: answers.telegramNotifications,
    generateDeploy: answers.generateDeploy,
    appName: answers.appName,
    deployPath: answers.deployPath,
    scriptPath: answers.scriptPath,
    port: answers.port,
    runner: answers.runner as 'github' | 'self-hosted',
  };

  const genSpinner = ora('Generating GitHub Actions CI workflow...').start();
  try {
    const outputPath = await generateGitHubWorkflow(projectDir, customizedDetection);
    genSpinner.succeed('GitHub Actions workflow generated successfully!');
    logger.success(`Created workflow file at: ${path.relative(projectDir, outputPath)}`);

    if (customizedDetection.generateDeploy) {
      const deploySpinner = ora('Generating CD deployment files...').start();
      try {
        const { generateDeployWorkflow, generatePMEcosystem } =
          await import('../generators/github.js');
        const deployPathFile = await generateDeployWorkflow(projectDir, customizedDetection);
        const ecoPathFile = await generatePMEcosystem(projectDir, customizedDetection);
        deploySpinner.succeed('CD deployment and PM2 config files generated successfully!');
        logger.success(`Created deploy workflow at: ${path.relative(projectDir, deployPathFile)}`);
        logger.success(
          `Created PM2 ecosystem config at: ${path.relative(projectDir, ecoPathFile)}`
        );

        console.log('\n======================================================');
        logger.info('🚀 Deployment Setup Guide:');
        logger.info(
          'To enable CD deployment, add the following Secrets to your GitHub repository:'
        );
        logger.info('  1. HOST: Remote server IP/Domain');
        logger.info('  2. PORT: Remote server SSH port (e.g. 22)');
        logger.info('  3. USERNAME: SSH username (e.g. ubuntu)');
        logger.info('  4. SSH_KEY: SSH private key');
        logger.info('\nShared Directory Setup on Server:');
        logger.info(
          `Create the shared folder at: ${customizedDetection.deployPath}/${customizedDetection.appName}/shared`
        );
        logger.info(
          `And place your production .env file at: ${customizedDetection.deployPath}/${customizedDetection.appName}/shared/.env`
        );
        console.log('======================================================\n');
      } catch (err: any) {
        deploySpinner.fail('Failed to generate deployment files.');
        logger.error(err.message || err);
      }
    }
  } catch (err: any) {
    genSpinner.fail('Failed to generate workflow.');
    logger.error(err.message || err);
    process.exit(1);
  }
}

import ora from 'ora';
import path from 'path';
import { runAllDetectors } from '../detectors/index.js';
import { generateGitHubWorkflow } from '../generators/github.js';
import { logger } from '../utils/logger.js';
import type { DetectionResult, Framework, PackageManager } from '../types/index.js';

export interface GenerateOptions {
  framework?: string;
  pm?: string;
  node?: string;
  lint?: boolean;
  typecheck?: boolean;
  test?: boolean;
  build?: boolean;
  telegram?: boolean;
  deploy?: boolean;
  appName?: string;
  deployPath?: string;
  scriptPath?: string;
  port?: string;
  runner?: 'github' | 'self-hosted';
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const projectDir = process.cwd();

  // Run detectors first to obtain fallback values
  let detection: DetectionResult;
  try {
    detection = await runAllDetectors(projectDir);
  } catch {
    logger.warn('Project detection failed. Falling back to generic defaults.');
    detection = {
      framework: 'node',
      packageManager: 'npm',
      nodeVersion: '22',
      hasLockfile: false,
      hasTsConfig: false,
      hasTests: false,
      hasLintScript: false,
      hasBuildScript: false,
    };
  }

  // Override options
  const frameworkInput = (options.framework?.toLowerCase() || detection.framework) as Framework;
  const pmInput = (options.pm?.toLowerCase() || detection.packageManager) as PackageManager;
  const nodeVersionInput = options.node || detection.nodeVersion;

  const customizedDetection: DetectionResult = {
    framework: frameworkInput,
    packageManager: pmInput,
    nodeVersion: nodeVersionInput.trim(),
    hasLockfile: detection.hasLockfile,
    hasTsConfig: options.typecheck !== undefined ? options.typecheck : detection.hasTsConfig,
    hasTests: options.test !== undefined ? options.test : detection.hasTests,
    hasLintScript: options.lint !== undefined ? options.lint : detection.hasLintScript,
    hasBuildScript: options.build !== undefined ? options.build : detection.hasBuildScript,
    telegramNotifications: options.telegram || false,
    generateDeploy: options.deploy || false,
    appName: options.appName,
    deployPath: options.deployPath,
    scriptPath: options.scriptPath,
    port: options.port,
    runner: options.runner || 'github',
  };

  const genSpinner = ora(`Generating CI workflow for ${customizedDetection.framework}...`).start();
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

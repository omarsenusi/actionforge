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
  };

  const genSpinner = ora(`Generating CI workflow for ${customizedDetection.framework}...`).start();
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

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { runAllDetectors } from '../detectors/index.js';
import { logger } from '../utils/logger.js';

export async function doctorCommand(): Promise<void> {
  const projectDir = process.cwd();
  logger.info('Running ActionForge diagnostics...\n');

  const packageJsonPath = path.join(projectDir, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    logger.error('No package.json found in the current directory.');
    logger.error('ActionForge is designed for Node.js/JavaScript/TypeScript projects.');
    logger.error('Please run this tool in a Node.js project directory containing a package.json.');
    process.exit(1);
  }

  let packageJson: any = {};
  try {
    packageJson = await fs.readJson(packageJsonPath);
  } catch {
    logger.error('Failed to parse package.json. Ensure it contains valid JSON.');
    process.exit(1);
  }

  let warningsCount = 0;

  // 1. Check framework and general detectors
  const detection = await runAllDetectors(projectDir);
  logger.success(`Detected framework: ${chalk.cyan(detection.framework)}`);
  logger.success(`Detected package manager: ${chalk.cyan(detection.packageManager)}`);
  logger.success(`Detected Node.js version: ${chalk.cyan(detection.nodeVersion)}`);

  // 2. Check lockfile
  if (!detection.hasLockfile) {
    logger.warn(
      'No lockfile detected. We highly recommend committing a lockfile (package-lock.json, pnpm-lock.yaml, yarn.lock, or bun.lockb) to ensure reproducible builds.'
    );
    warningsCount++;
  } else {
    // Check if the detected PM actually matches the lockfile.
    const lockfileMatches =
      (detection.packageManager === 'npm' &&
        (await fs.pathExists(path.join(projectDir, 'package-lock.json')))) ||
      (detection.packageManager === 'pnpm' &&
        (await fs.pathExists(path.join(projectDir, 'pnpm-lock.yaml')))) ||
      (detection.packageManager === 'yarn' &&
        (await fs.pathExists(path.join(projectDir, 'yarn.lock')))) ||
      (detection.packageManager === 'bun' &&
        ((await fs.pathExists(path.join(projectDir, 'bun.lockb'))) ||
          (await fs.pathExists(path.join(projectDir, 'bun.lock')))));

    if (!lockfileMatches) {
      logger.warn(
        `Detected lockfile does not match the active package manager (${detection.packageManager}).`
      );
      warningsCount++;
    } else {
      logger.success('Lockfile configuration matches package manager.');
    }
  }

  // 3. Check typescript
  if (detection.hasTsConfig) {
    logger.success('TypeScript configuration (tsconfig.json) found.');
  } else if (['nest', 'adonis'].includes(detection.framework)) {
    logger.warn(
      `Framework "${detection.framework}" usually requires TypeScript, but no tsconfig.json was found.`
    );
    warningsCount++;
  }

  // 4. Check package.json scripts
  const scripts = packageJson.scripts || {};
  if (!scripts.lint) {
    logger.warn(
      'No "lint" script defined in package.json. ActionForge will exclude the Lint step by default.'
    );
    warningsCount++;
  } else {
    logger.success('Found "lint" script.');
  }

  if (detection.hasTsConfig && !scripts.typecheck && !scripts.tsc) {
    logger.info(
      'Tip: You have tsconfig.json, but no "typecheck" script. We will run "tsc --noEmit" automatically.'
    );
  }

  if (!scripts.test || scripts.test.includes('no test specified')) {
    logger.warn(
      'No valid "test" script defined in package.json. ActionForge will exclude the Test step by default.'
    );
    warningsCount++;
  } else {
    logger.success('Found "test" script.');
  }

  if (!scripts.build) {
    if (['next', 'nest', 'adonis'].includes(detection.framework)) {
      logger.warn(
        `Framework "${detection.framework}" requires a build step, but no "build" script was found in package.json.`
      );
      warningsCount++;
    } else {
      logger.info('No "build" script defined (common for vanilla Node/Express backends).');
    }
  } else {
    logger.success('Found "build" script.');
  }

  // 5. Check if .github/workflows/ci.yml already exists
  const ciPath = path.join(projectDir, '.github', 'workflows', 'ci.yml');
  if (await fs.pathExists(ciPath)) {
    logger.info('GitHub Actions CI workflow already exists at .github/workflows/ci.yml.');
  } else {
    logger.info('No GitHub Actions CI workflow found. Run "actionforge init" to create one.');
  }

  console.log('');
  if (warningsCount === 0) {
    logger.success('All checks passed! Project is perfectly ready for GitHub Actions CI.');
  } else {
    logger.info(`Diagnostics completed with ${chalk.yellow(warningsCount)} warnings.`);
  }
}

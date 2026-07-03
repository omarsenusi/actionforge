import fs from 'fs-extra';
import path from 'path';
import { detectFramework } from './framework.js';
import { detectPackageManager } from './packageManager.js';
import { detectNodeVersion } from './node.js';
import type { DetectionResult } from '../types/index.js';

export async function runAllDetectors(projectDir: string): Promise<DetectionResult> {
  let packageJson: any = {};
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    try {
      packageJson = await fs.readJson(packageJsonPath);
    } catch {
      // Ignore invalid JSON errors
    }
  }

  const framework = await detectFramework(projectDir, packageJson);
  const packageManager = await detectPackageManager(projectDir);
  const nodeVersion = await detectNodeVersion(projectDir, packageJson);

  const hasLockfile =
    (await fs.pathExists(path.join(projectDir, 'package-lock.json'))) ||
    (await fs.pathExists(path.join(projectDir, 'pnpm-lock.yaml'))) ||
    (await fs.pathExists(path.join(projectDir, 'yarn.lock'))) ||
    (await fs.pathExists(path.join(projectDir, 'bun.lockb'))) ||
    (await fs.pathExists(path.join(projectDir, 'bun.lock')));

  const hasTsConfig = await fs.pathExists(path.join(projectDir, 'tsconfig.json'));

  const scripts = packageJson.scripts || {};
  const hasTests = typeof scripts.test === 'string' && !scripts.test.includes('no test specified');
  const hasLintScript = typeof scripts.lint === 'string';
  const hasBuildScript = typeof scripts.build === 'string';

  return {
    framework,
    packageManager,
    nodeVersion,
    hasLockfile,
    hasTsConfig,
    hasTests,
    hasLintScript,
    hasBuildScript,
  };
}

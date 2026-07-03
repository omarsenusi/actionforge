import fs from 'fs-extra';
import path from 'path';
import type { PackageManager } from '../types/index.js';

export async function detectPackageManager(projectDir: string): Promise<PackageManager> {
  if (await fs.pathExists(path.join(projectDir, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (await fs.pathExists(path.join(projectDir, 'yarn.lock'))) {
    return 'yarn';
  }
  if (
    (await fs.pathExists(path.join(projectDir, 'bun.lockb'))) ||
    (await fs.pathExists(path.join(projectDir, 'bun.lock')))
  ) {
    return 'bun';
  }
  if (await fs.pathExists(path.join(projectDir, 'package-lock.json'))) {
    return 'npm';
  }
  return 'npm';
}

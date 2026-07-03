import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { detectPackageManager } from '../src/detectors/packageManager.js';
import { detectNodeVersion } from '../src/detectors/node.js';
import { detectFramework } from '../src/detectors/framework.js';
import { runAllDetectors } from '../src/detectors/index.js';

describe('Detectors', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'actionforge-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('PackageManager Detector', () => {
    it('should detect pnpm when pnpm-lock.yaml is present', async () => {
      await fs.writeFile(path.join(tempDir, 'pnpm-lock.yaml'), '');
      const pm = await detectPackageManager(tempDir);
      expect(pm).toBe('pnpm');
    });

    it('should detect yarn when yarn.lock is present', async () => {
      await fs.writeFile(path.join(tempDir, 'yarn.lock'), '');
      const pm = await detectPackageManager(tempDir);
      expect(pm).toBe('yarn');
    });

    it('should detect bun when bun.lockb is present', async () => {
      await fs.writeFile(path.join(tempDir, 'bun.lockb'), '');
      const pm = await detectPackageManager(tempDir);
      expect(pm).toBe('bun');
    });

    it('should detect npm when package-lock.json is present', async () => {
      await fs.writeFile(path.join(tempDir, 'package-lock.json'), '');
      const pm = await detectPackageManager(tempDir);
      expect(pm).toBe('npm');
    });

    it('should fallback to npm when no lockfile is present', async () => {
      const pm = await detectPackageManager(tempDir);
      expect(pm).toBe('npm');
    });
  });

  describe('Node Version Detector', () => {
    it('should detect version from .nvmrc', async () => {
      await fs.writeFile(path.join(tempDir, '.nvmrc'), 'v20.10.0\n');
      const version = await detectNodeVersion(tempDir);
      expect(version).toBe('20.10.0');
    });

    it('should detect version from package.json engines', async () => {
      const packageJson = { engines: { node: '>=18.0.0' } };
      const version = await detectNodeVersion(tempDir, packageJson);
      expect(version).toBe('18');
    });

    it('should prioritize .nvmrc over package.json engines', async () => {
      await fs.writeFile(path.join(tempDir, '.nvmrc'), '22.2.0');
      const packageJson = { engines: { node: '>=20.0.0' } };
      const version = await detectNodeVersion(tempDir, packageJson);
      expect(version).toBe('22.2.0');
    });

    it('should fallback to 22 when no version configuration exists', async () => {
      const version = await detectNodeVersion(tempDir);
      expect(version).toBe('22');
    });
  });

  describe('Framework Detector', () => {
    it('should detect nest when @nestjs/core is in dependencies', async () => {
      const packageJson = { dependencies: { '@nestjs/core': '^10.0.0' } };
      const framework = await detectFramework(tempDir, packageJson);
      expect(framework).toBe('nest');
    });

    it('should detect adonis when adonisrc.ts is present', async () => {
      await fs.writeFile(path.join(tempDir, 'adonisrc.ts'), '');
      const framework = await detectFramework(tempDir, {});
      expect(framework).toBe('adonis');
    });

    it('should detect next when next is in dependencies', async () => {
      const packageJson = { devDependencies: { next: '^14.0.0' } };
      const framework = await detectFramework(tempDir, packageJson);
      expect(framework).toBe('next');
    });

    it('should fallback to node when no framework matches', async () => {
      const framework = await detectFramework(tempDir, {});
      expect(framework).toBe('node');
    });
  });

  describe('runAllDetectors composite function', () => {
    it('should return aggregated detection details', async () => {
      const pkg = {
        name: 'my-app',
        scripts: {
          test: 'vitest run',
          lint: 'eslint .',
        },
        engines: { node: '22.0.0' },
      };
      await fs.writeJson(path.join(tempDir, 'package.json'), pkg);
      await fs.writeFile(path.join(tempDir, 'pnpm-lock.yaml'), '');
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}');

      const result = await runAllDetectors(tempDir);
      expect(result.framework).toBe('node');
      expect(result.packageManager).toBe('pnpm');
      expect(result.nodeVersion).toBe('22');
      expect(result.hasLockfile).toBe(true);
      expect(result.hasTsConfig).toBe(true);
      expect(result.hasTests).toBe(true);
      expect(result.hasLintScript).toBe(true);
      expect(result.hasBuildScript).toBe(false);
    });
  });
});

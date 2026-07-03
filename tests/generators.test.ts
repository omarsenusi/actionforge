import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { getTemplatesDir, readAndCompileTemplate } from '../src/utils/template.js';
import { generateGitHubWorkflow } from '../src/generators/github.js';
import type { DetectionResult } from '../src/types/index.js';

describe('Generators and Templates', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'actionforge-test-gen-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should locate templates directory', () => {
    const dir = getTemplatesDir();
    expect(fs.existsSync(dir)).toBe(true);
    expect(fs.existsSync(path.join(dir, 'github', 'node', 'ci.hbs'))).toBe(true);
  });

  it('should compile a template with Handlebars correctly', async () => {
    const variables = {
      nodeVersion: '22',
      packageManager: 'pnpm',
      installCommand: 'pnpm install --frozen-lockfile',
      buildCommand: 'pnpm build',
      testCommand: 'pnpm test',
      lintCommand: 'pnpm lint',
      typecheckCommand: 'npx tsc --noEmit',
    };

    const output = await readAndCompileTemplate('node', variables);
    expect(output).toContain('name: Node.js CI');
    expect(output).toContain("node-version: '22'");
    expect(output).toContain('pnpm install --frozen-lockfile');
    expect(output).toContain('pnpm build');
    expect(output).toContain('pnpm test');
  });

  it('should generate a .github/workflows/ci.yml file in the workspace', async () => {
    const mockDetection: DetectionResult = {
      framework: 'nest',
      packageManager: 'npm',
      nodeVersion: '20',
      hasLockfile: true,
      hasTsConfig: true,
      hasTests: true,
      hasLintScript: true,
      hasBuildScript: true,
    };

    const outputPath = await generateGitHubWorkflow(tempDir, mockDetection);
    expect(outputPath).toBe(path.join(tempDir, '.github', 'workflows', 'ci.yml'));
    expect(fs.existsSync(outputPath)).toBe(true);

    const fileContent = await fs.readFile(outputPath, 'utf-8');
    expect(fileContent).toContain('name: NestJS CI');
    expect(fileContent).toContain('npm ci');
    expect(fileContent).toContain('npm run build');
    expect(fileContent).toContain('npm run test');
  });
});

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { generateCommand } from '../src/commands/generate.js';

describe('CLI Commands', () => {
  let tempDir: string;
  let cwdSpy: any;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'actionforge-test-cmd-'));
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
  });

  afterEach(async () => {
    cwdSpy.mockRestore();
    await fs.remove(tempDir);
  });

  describe('generateCommand', () => {
    it('should generate a default CI workflow file in non-interactive mode', async () => {
      await fs.writeJson(path.join(tempDir, 'package.json'), {
        name: 'test-app',
        scripts: {
          test: 'vitest run',
          build: 'tsc',
        },
      });
      await fs.writeFile(path.join(tempDir, 'pnpm-lock.yaml'), '');

      // Run generate command with options
      await generateCommand({
        framework: 'next',
        pm: 'pnpm',
        node: '18',
      });

      const ciPath = path.join(tempDir, '.github', 'workflows', 'ci.yml');
      expect(fs.existsSync(ciPath)).toBe(true);

      const content = await fs.readFile(ciPath, 'utf-8');
      expect(content).toContain('name: Next.js CI');
      expect(content).toContain("node-version: '18'");
      expect(content).toContain('pnpm install --frozen-lockfile');
    });
  });
});

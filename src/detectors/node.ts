import fs from 'fs-extra';
import path from 'path';

export async function detectNodeVersion(
  projectDir: string,
  packageJson: any = {}
): Promise<string> {
  // 1. Check .nvmrc
  const nvmrcPath = path.join(projectDir, '.nvmrc');
  if (await fs.pathExists(nvmrcPath)) {
    try {
      const content = await fs.readFile(nvmrcPath, 'utf-8');
      const version = content.trim().replace(/^v/, '');
      if (version) {
        return version;
      }
    } catch {
      // Ignore reading error
    }
  }

  // 2. Check package.json engines
  if (packageJson && packageJson.engines && typeof packageJson.engines.node === 'string') {
    const rawVersion = packageJson.engines.node;
    const match = rawVersion.match(/(\d+)(?:\.\d+)*(?:\.x)?/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 3. Fallback to latest LTS (22)
  return '22';
}

import fs from 'fs-extra';
import type { Framework } from '../types/index.js';
import { plugins } from '../services/plugin.js';

export async function detectFramework(
  projectDir: string,
  packageJson: any = {}
): Promise<Framework> {
  let files: string[] = [];
  try {
    files = await fs.readdir(projectDir);
  } catch {
    // Ignore error
  }

  // Iterate over plugins to find a match (excluding fallback 'node' plugin first)
  for (const plugin of plugins) {
    if (plugin.name !== 'node' && plugin.detect(packageJson, files)) {
      return plugin.name;
    }
  }

  return 'node';
}

import fs from 'fs-extra';
import path from 'path';
import { readAndCompileTemplate } from '../utils/template.js';
import { getPlugin } from '../services/plugin.js';
import type { DetectionResult } from '../types/index.js';

export async function generateGitHubWorkflow(
  projectDir: string,
  detection: DetectionResult
): Promise<string> {
  const plugin = getPlugin(detection.framework);
  const commands = plugin.getCommands(detection.packageManager, detection.hasTsConfig);

  // Compile variables based on actual project scripts availability
  const variables = {
    nodeVersion: detection.nodeVersion,
    packageManager: detection.packageManager,
    installCommand: commands.install,
    buildCommand: detection.hasBuildScript ? commands.build : null,
    testCommand: detection.hasTests ? commands.test : null,
    lintCommand: detection.hasLintScript ? commands.lint : null,
    typecheckCommand: detection.hasTsConfig ? commands.typecheck : null,
    telegramNotifications: detection.telegramNotifications,
  };

  const yamlContent = await readAndCompileTemplate(detection.framework, variables);

  const workflowDir = path.join(projectDir, '.github', 'workflows');
  await fs.ensureDir(workflowDir);

  const outputPath = path.join(workflowDir, 'ci.yml');
  await fs.writeFile(outputPath, yamlContent, 'utf-8');

  return outputPath;
}

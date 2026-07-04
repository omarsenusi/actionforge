import fs from 'fs-extra';
import path from 'path';
import {
  readAndCompileTemplate,
  readAndCompileDeployTemplate,
  readAndCompilePMEcosystemTemplate,
  readAndCompileDeployShellTemplate,
} from '../utils/template.js';
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
    runnerLabel: detection.runner === 'self-hosted' ? 'self-hosted' : 'ubuntu-latest',
  };

  const yamlContent = await readAndCompileTemplate(detection.framework, variables);

  const workflowDir = path.join(projectDir, '.github', 'workflows');
  await fs.ensureDir(workflowDir);

  const outputPath = path.join(workflowDir, 'ci.yml');
  await fs.writeFile(outputPath, yamlContent, 'utf-8');

  return outputPath;
}

export async function generateDeployWorkflow(
  projectDir: string,
  detection: DetectionResult
): Promise<string> {
  const plugin = getPlugin(detection.framework);
  const commands = plugin.getCommands(detection.packageManager, detection.hasTsConfig);

  const variables = {
    nodeVersion: detection.nodeVersion,
    packageManager: detection.packageManager,
    installCommand: commands.install,
    buildCommand: detection.hasBuildScript ? commands.build : 'npm run build',
    appName: detection.appName || 'devbool',
    deployPath: detection.deployPath || '/home/ubuntu/apps',
    scriptPath: detection.scriptPath || 'bin/server.js',
    port: detection.port || '3333',
    telegramNotifications: detection.telegramNotifications,
    runnerLabel: detection.runner === 'self-hosted' ? 'self-hosted' : 'ubuntu-latest',
  };

  const yamlContent = await readAndCompileDeployTemplate(variables);

  const workflowDir = path.join(projectDir, '.github', 'workflows');
  await fs.ensureDir(workflowDir);

  const outputPath = path.join(workflowDir, 'deploy.yml');
  await fs.writeFile(outputPath, yamlContent, 'utf-8');

  return outputPath;
}

export async function generatePMEcosystem(
  projectDir: string,
  detection: DetectionResult
): Promise<string> {
  const variables = {
    appName: detection.appName || 'devbool',
    deployPath: detection.deployPath || '/home/ubuntu/apps',
    scriptPath: detection.scriptPath || 'bin/server.js',
    port: detection.port || '3333',
  };

  const jsContent = await readAndCompilePMEcosystemTemplate(variables);
  const outputPath = path.join(projectDir, 'ecosystem.config.js');
  await fs.writeFile(outputPath, jsContent, 'utf-8');

  return outputPath;
}

export async function generateDeployShellScript(
  projectDir: string,
  detection: DetectionResult
): Promise<string> {
  const plugin = getPlugin(detection.framework);
  const commands = plugin.getCommands(detection.packageManager, detection.hasTsConfig);

  const variables = {
    appName: detection.appName || 'devbool',
    deployPath: detection.deployPath || '/home/ubuntu/apps',
    installCommand: commands.install,
    buildCommand: detection.hasBuildScript ? commands.build : 'npm run build',
  };

  const shContent = await readAndCompileDeployShellTemplate(variables);
  const outputPath = path.join(projectDir, 'deploy.sh');
  await fs.writeFile(outputPath, shContent, 'utf-8');

  try {
    await fs.chmod(outputPath, 0o755);
  } catch {
    // Ignore chmod errors on Windows
  }

  return outputPath;
}

import fs from 'fs-extra';
import path from 'path';
import {
  readAndCompileTemplate,
  readAndCompileDeployTemplate,
  readAndCompilePMEcosystemTemplate,
  readAndCompileDeployShellTemplate,
  readAndCompileDeployNotifyTemplate,
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
  const deployDir = path.join(projectDir, 'deploy');
  await fs.ensureDir(deployDir);

  const outputPath = path.join(deployDir, 'deploy.sh');
  await fs.writeFile(outputPath, shContent, 'utf-8');

  try {
    await fs.chmod(outputPath, 0o755);
  } catch {
    // Ignore chmod errors on Windows
  }

  // Create .gitignore
  const gitignorePath = path.join(deployDir, '.gitignore');
  const gitignoreContent = `# Ignore all files in this folder to protect secrets\n*\n# Allow tracking the script and configurations\n!.gitignore\n!deploy.sh\n!notify.js\n!*.example\n`;
  await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');

  // Create notify.js
  const notifyContent = await readAndCompileDeployNotifyTemplate(variables);
  await fs.writeFile(path.join(deployDir, 'notify.js'), notifyContent, 'utf-8');

  // Create .env.deploy if it doesn't exist
  const envPath = path.join(deployDir, '.env.deploy');
  const envContent = `# Remote Server Credentials\nDEPLOY_HOST=""\nDEPLOY_USERNAME="ubuntu"\nDEPLOY_PORT="22"\nDEPLOY_APP_NAME="${variables.appName}"\nDEPLOY_PATH="${variables.deployPath}"\n\n# SSH Private Key (Provide EITHER the raw multiline key OR path to the key file)\nDEPLOY_SSH_KEY=""\nDEPLOY_SSH_KEY_PATH=""\n\n# Telegram Notifications\nTELEGRAM_BOT_TOKEN=""\nTELEGRAM_CHAT_ID=""\n`;
  if (!(await fs.pathExists(envPath))) {
    await fs.writeFile(envPath, envContent, 'utf-8');
  }

  // Create .env.example
  const envExamplePath = path.join(deployDir, '.env.example');
  await fs.writeFile(envExamplePath, envContent, 'utf-8');

  // Update root .gitignore to ignore build.tar.gz
  const rootGitignorePath = path.join(projectDir, '.gitignore');
  const ignoreEntry = '\n# ActionForge temporary deployment package\nbuild.tar.gz\n';
  if (await fs.pathExists(rootGitignorePath)) {
    const rootGitignoreContent = await fs.readFile(rootGitignorePath, 'utf-8');
    if (!rootGitignoreContent.includes('build.tar.gz')) {
      await fs.appendFile(rootGitignorePath, ignoreEntry, 'utf-8');
    }
  } else {
    await fs.writeFile(rootGitignorePath, ignoreEntry.trim() + '\n', 'utf-8');
  }

  return outputPath;
}

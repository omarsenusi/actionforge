export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type Framework = 'adonis' | 'nest' | 'next' | 'express' | 'fastify' | 'node';

export interface DetectionResult {
  framework: Framework;
  packageManager: PackageManager;
  nodeVersion: string;
  hasLockfile: boolean;
  hasTsConfig: boolean;
  hasTests: boolean;
  hasLintScript: boolean;
  hasBuildScript: boolean;
  telegramNotifications?: boolean;
  appName?: string | undefined;
  deployPath?: string | undefined;
  scriptPath?: string | undefined;
  port?: string | undefined;
  generateDeploy?: boolean | undefined;
  runner?: 'github' | 'self-hosted' | undefined;
}

export interface FrameworkPlugin {
  name: Framework;
  displayName: string;
  detect(packageJson: any, files: string[]): boolean;
  getCommands(
    pm: PackageManager,
    hasTsConfig: boolean
  ): {
    install: string;
    build: string | null;
    test: string | null;
    lint: string | null;
    typecheck: string | null;
  };
}

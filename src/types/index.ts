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

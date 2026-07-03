import type { Framework, FrameworkPlugin, PackageManager } from '../types/index.js';

export const AdonisPlugin: FrameworkPlugin = {
  name: 'adonis',
  displayName: 'AdonisJS',
  detect(packageJson, files) {
    const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
    return (
      !!deps['@adonisjs/core'] || files.includes('adonisrc.ts') || files.includes('.adonisrc.json')
    );
  },
  getCommands(pm, hasTsConfig) {
    const runCmd =
      pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm' : 'bun run';
    const install =
      pm === 'npm'
        ? 'npm ci'
        : pm === 'pnpm'
          ? 'pnpm install --frozen-lockfile'
          : pm === 'yarn'
            ? 'yarn install --frozen-lockfile'
            : 'bun install --frozen-lockfile';
    return {
      install,
      build: `${runCmd} build`,
      test: `${runCmd} test`,
      lint: `${runCmd} lint`,
      typecheck: hasTsConfig ? 'npx tsc --noEmit' : null,
    };
  },
};

export const NestPlugin: FrameworkPlugin = {
  name: 'nest',
  displayName: 'NestJS',
  detect(packageJson, files) {
    const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
    return !!deps['@nestjs/core'] || files.includes('nest-cli.json');
  },
  getCommands(pm, hasTsConfig) {
    const runCmd =
      pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm' : 'bun run';
    const install =
      pm === 'npm'
        ? 'npm ci'
        : pm === 'pnpm'
          ? 'pnpm install --frozen-lockfile'
          : pm === 'yarn'
            ? 'yarn install --frozen-lockfile'
            : 'bun install --frozen-lockfile';
    return {
      install,
      build: `${runCmd} build`,
      test: `${runCmd} test`,
      lint: `${runCmd} lint`,
      typecheck: hasTsConfig ? 'npx tsc --noEmit' : null,
    };
  },
};

export const NextPlugin: FrameworkPlugin = {
  name: 'next',
  displayName: 'Next.js',
  detect(packageJson, files) {
    const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
    return (
      !!deps['next'] ||
      files.includes('next.config.js') ||
      files.includes('next.config.mjs') ||
      files.includes('next.config.ts')
    );
  },
  getCommands(pm, hasTsConfig) {
    const runCmd =
      pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm' : 'bun run';
    const install =
      pm === 'npm'
        ? 'npm ci'
        : pm === 'pnpm'
          ? 'pnpm install --frozen-lockfile'
          : pm === 'yarn'
            ? 'yarn install --frozen-lockfile'
            : 'bun install --frozen-lockfile';
    return {
      install,
      build: `${runCmd} build`,
      test: `${runCmd} test`,
      lint: `${runCmd} lint`,
      typecheck: hasTsConfig ? 'npx tsc --noEmit' : null,
    };
  },
};

export const ExpressPlugin: FrameworkPlugin = {
  name: 'express',
  displayName: 'Express',
  detect(packageJson) {
    const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
    return !!deps['express'];
  },
  getCommands(pm, hasTsConfig) {
    const runCmd =
      pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm' : 'bun run';
    const install =
      pm === 'npm'
        ? 'npm install'
        : pm === 'pnpm'
          ? 'pnpm install --frozen-lockfile'
          : pm === 'yarn'
            ? 'yarn install --frozen-lockfile'
            : 'bun install --frozen-lockfile';
    return {
      install,
      build: `${runCmd} build`,
      test: `${runCmd} test`,
      lint: `${runCmd} lint`,
      typecheck: hasTsConfig ? 'npx tsc --noEmit' : null,
    };
  },
};

export const FastifyPlugin: FrameworkPlugin = {
  name: 'fastify',
  displayName: 'Fastify',
  detect(packageJson) {
    const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
    return !!deps['fastify'];
  },
  getCommands(pm, hasTsConfig) {
    const runCmd =
      pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm' : 'bun run';
    const install =
      pm === 'npm'
        ? 'npm install'
        : pm === 'pnpm'
          ? 'pnpm install --frozen-lockfile'
          : pm === 'yarn'
            ? 'yarn install --frozen-lockfile'
            : 'bun install --frozen-lockfile';
    return {
      install,
      build: `${runCmd} build`,
      test: `${runCmd} test`,
      lint: `${runCmd} lint`,
      typecheck: hasTsConfig ? 'npx tsc --noEmit' : null,
    };
  },
};

export const NodePlugin: FrameworkPlugin = {
  name: 'node',
  displayName: 'Node.js',
  detect() {
    return true; // Fallback
  },
  getCommands(pm, hasTsConfig) {
    const runCmd =
      pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm' : 'bun run';
    const install =
      pm === 'npm'
        ? 'npm install'
        : pm === 'pnpm'
          ? 'pnpm install --frozen-lockfile'
          : pm === 'yarn'
            ? 'yarn install --frozen-lockfile'
            : 'bun install --frozen-lockfile';
    return {
      install,
      build: `${runCmd} build`,
      test: `${runCmd} test`,
      lint: `${runCmd} lint`,
      typecheck: hasTsConfig ? 'npx tsc --noEmit' : null,
    };
  },
};

export const plugins: FrameworkPlugin[] = [
  AdonisPlugin,
  NestPlugin,
  NextPlugin,
  ExpressPlugin,
  FastifyPlugin,
  NodePlugin, // Make sure node is last as it is the fallback
];

export function getPlugin(name: Framework): FrameworkPlugin {
  const plugin = plugins.find((p) => p.name === name);
  if (!plugin) {
    return NodePlugin;
  }
  return plugin;
}

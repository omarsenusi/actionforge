# ActionForge

[![NPM Version](https://img.shields.io/npm/v/actionforge.svg)](https://www.npmjs.com/package/actionforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Status](https://github.com/omarsenusi/actionforge/actions/workflows/ci.yml/badge.svg)](https://github.com/omarsenusi/actionforge/actions)

ActionForge is a powerful, production-ready Command Line Interface (CLI) to automatically detect your codebase configuration and generate secure, high-performance GitHub Actions CI/CD workflows tailored to your stack.

---

## 🚀 Features

- **Framework Detection**: Instantly detects NestJS, AdonisJS, Next.js, Express, Fastify, and Node.js.
- **Package Manager Detector**: Detects lockfiles for `npm`, `pnpm`, `yarn`, and `bun`.
- **Node.js Environment Syncing**: Resolves runner version via `.nvmrc` or `package.json` engines.
- **Optimized Caching**: Integrates package-manager caching and Next.js compiler build caching.
- **Step Summaries**: Appends markdown execution outcomes to GitHub Step Summaries.
- **Extensible Architecture**: Modulized plugin architecture designed for community growth.

---

## 📦 Installation

Initialize directly using `npx`:

```bash
npx actionforge init
```

Or install globally on your system:

```bash
npm install -g actionforge
```

---

## 🛠 Commands

### 1. Interactive Setup (`actionforge init`)

Starts an interactive terminal setup wizard to scan, customize, and write the CI workflow:

```bash
actionforge init
```

### 2. Override Generator (`actionforge generate`)

Generates a workflow directly based on command-line flags (ideal for non-interactive scripts or docker environments):

```bash
actionforge generate --framework next --pm pnpm --node 22
```

**Options:**
- `-f, --framework <framework>`: Framework choice (`next`, `nest`, `adonis`, `express`, `fastify`, `node`)
- `-p, --pm <packageManager>`: Package manager (`npm`, `pnpm`, `yarn`, `bun`)
- `-n, --node <version>`: Node.js runner version (e.g. `20`, `22`)
- `--no-lint`: Exclude code lint check step
- `--no-typecheck`: Exclude typescript check step
- `--no-test`: Exclude test execution step
- `--no-build`: Exclude build compilation step

### 3. Setup Diagnostics (`actionforge doctor`)

Analyzes the local project structure to ensure maximum compatibility with GitHub Actions CI, checking configurations, scripts, lock files, and git status:

```bash
actionforge doctor
```

---

## 📊 Framework Support Matrix

| Framework | Lockfile Caching | Build Caching | Artifact Upload | Build Directory |
| :--- | :---: | :---: | :---: | :---: |
| **Node.js (Vanilla)** | Yes | No | Yes | `dist/` |
| **NestJS** | Yes | No | Yes | `dist/` |
| **AdonisJS** | Yes | No | Yes | `build/` |
| **Next.js** | Yes | Yes (`.next/cache`) | Yes | `.next/` |
| **Express** | Yes | No | Yes (Optional) | `dist/` |
| **Fastify** | Yes | No | Yes (Optional) | `dist/` |

---

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](file:///f:/projects/actionforge/CONTRIBUTING.md) to understand branch conventions, style compliance, and testing commands.

---

## 📜 License

Distributed under the MIT License. See [LICENSE](file:///f:/projects/actionforge/LICENSE) for more information.

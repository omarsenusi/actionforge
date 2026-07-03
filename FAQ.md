# Frequently Asked Questions

### What is ActionForge?
ActionForge is a command-line utility that inspects your repository setup and automatically writes production-grade, highly-cached GitHub Actions workflows matching DevOps best practices.

### Which frameworks are supported?
ActionForge supports **AdonisJS**, **NestJS**, **Next.js**, **Express**, **Fastify**, and generic **Node.js** out of the box.

### How does caching work in generated workflows?
We use `actions/setup-node`'s built-in caching for `npm`, `pnpm`, and `yarn` (based on their lockfiles). For `bun`, we utilize `oven-sh/setup-bun` caching. In Next.js, we also cache the `.next/cache` folder across builds to leverage Next's incremental compiler.

### Can I run the generated workflow on other OS runners?
Yes, you can edit the generated `.github/workflows/ci.yml` file and modify the `runs-on` property (e.g. to run on `windows-latest` or self-hosted runners).

### How can I add new frameworks?
ActionForge is built using a pluggable architecture. Simply define a new plugin implementing `FrameworkPlugin` inside `src/services/plugin.ts` and add a matching Handlebars template in `templates/github/<framework_name>/ci.hbs`.

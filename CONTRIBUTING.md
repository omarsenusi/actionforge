# Contributing to ActionForge

First off, thank you for taking the time to contribute!

## Development Requirements
- **Node.js**: v22.0.0 or higher
- **npm**: v10.0.0 or higher

## Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/omarsenusi/actionforge.git
   cd actionforge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Development Commands
- **Build TypeScript**: `npm run build`
- **Lint Code**: `npm run lint`
- **Format Code**: `npm run format`
- **Run Tests**: `npm run test`

## Contribution Workflow
1. Fork the repo and create your feature branch: `git checkout -b feature/amazing-feature`
2. Implement your changes and write unit tests inside `tests/`
3. Verify that all tests pass (`npm run test`) and code styles match (`npm run lint` & `npm run format`)
4. Commit your changes: `git commit -m "feat: add amazing feature"`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request detailing the changes made.

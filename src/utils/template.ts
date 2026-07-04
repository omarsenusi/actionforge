import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register standard helpers needed in our templates
Handlebars.registerHelper('eq', (a: any, b: any) => a === b);

export function getTemplatesDir(): string {
  // Check typical locations relative to either the source file or the compiled output in dist/
  const possiblePaths = [
    path.resolve(__dirname, '../../templates'), // from dist/utils/
    path.resolve(__dirname, '../../../templates'), // fallback if nested deeper
    path.resolve(process.cwd(), 'templates'), // local dev root folder
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Fallback
  return path.resolve(__dirname, '../../templates');
}

export async function readAndCompileTemplate(
  framework: string,
  data: Record<string, any>
): Promise<string> {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, 'github', framework, 'ci.hbs');

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`Template not found for framework "${framework}" at path: ${templatePath}`);
  }

  const source = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(source);
  return template(data);
}

export async function readAndCompileDeployTemplate(data: Record<string, any>): Promise<string> {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, 'github', 'deploy.hbs');

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`Deploy template not found at path: ${templatePath}`);
  }

  const source = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(source);
  return template(data);
}

export async function readAndCompilePMEcosystemTemplate(
  data: Record<string, any>
): Promise<string> {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, 'pm2', 'ecosystem.hbs');

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`PM2 ecosystem template not found at path: ${templatePath}`);
  }

  const source = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(source);
  return template(data);
}

export async function readAndCompileDeployShellTemplate(
  data: Record<string, any>
): Promise<string> {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, 'pm2', 'deploy_sh.hbs');

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`PM2 deploy shell template not found at path: ${templatePath}`);
  }

  const source = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(source);
  return template(data);
}

export async function readAndCompileDeployNotifyTemplate(
  data: Record<string, any>
): Promise<string> {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, 'pm2', 'notify_js.hbs');

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`PM2 deploy notify template not found at path: ${templatePath}`);
  }

  const source = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(source);
  return template(data);
}

/**
 * Template engine — replaces {{VARIABLE}} placeholders and
 * evaluates {{#if FLAG}} ... {{/if}} conditional blocks.
 */

export interface TemplateVars {
  LANGUAGE: string;
  FRONTEND_FRAMEWORK: string;
  BACKEND_FRAMEWORK: string;
  DATABASE: string;
  DEPLOYMENT: string;
  CICD: string;
  PROJECT_NAME: string;
  SDD_VERSION: string;
  [key: string]: string;
}

/** Default values used when a preset does not specify a field */
export const UNCONFIGURED = '[not configured]';

/** Built-in preset stacks */
export const PRESETS: Record<string, Partial<TemplateVars>> = {
  'ts-nextjs': {
    LANGUAGE: 'TypeScript',
    FRONTEND_FRAMEWORK: 'Next.js',
    BACKEND_FRAMEWORK: 'Next.js API Routes',
    DATABASE: 'PostgreSQL',
    DEPLOYMENT: 'Vercel',
    CICD: 'GitHub Actions',
  },
  'ts-react': {
    LANGUAGE: 'TypeScript',
    FRONTEND_FRAMEWORK: 'React + Vite',
    BACKEND_FRAMEWORK: 'none',
    DATABASE: 'none',
    DEPLOYMENT: 'Vercel',
    CICD: 'GitHub Actions',
  },
  'py-fastapi': {
    LANGUAGE: 'Python',
    FRONTEND_FRAMEWORK: 'none',
    BACKEND_FRAMEWORK: 'FastAPI',
    DATABASE: 'PostgreSQL',
    DEPLOYMENT: 'Docker',
    CICD: 'GitHub Actions',
  },
  'py-django': {
    LANGUAGE: 'Python',
    FRONTEND_FRAMEWORK: 'none',
    BACKEND_FRAMEWORK: 'Django',
    DATABASE: 'PostgreSQL',
    DEPLOYMENT: 'Docker',
    CICD: 'GitHub Actions',
  },
  'go-gin': {
    LANGUAGE: 'Go',
    FRONTEND_FRAMEWORK: 'none',
    BACKEND_FRAMEWORK: 'Gin',
    DATABASE: 'PostgreSQL',
    DEPLOYMENT: 'Docker',
    CICD: 'GitHub Actions',
  },
  'js-express': {
    LANGUAGE: 'JavaScript',
    FRONTEND_FRAMEWORK: 'none',
    BACKEND_FRAMEWORK: 'Express',
    DATABASE: 'MongoDB',
    DEPLOYMENT: 'Railway',
    CICD: 'GitHub Actions',
  },
};

/**
 * Render a template string by replacing {{VAR}} and evaluating {{#if FLAG}} blocks.
 */
export function render(template: string, vars: TemplateVars): string {
  // 1. Evaluate {{#if FLAG}} ... {{/if}} blocks
  let result = template.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, flag: string, body: string) => {
      const value = vars[flag];
      const truthy =
        value !== undefined &&
        value !== '' &&
        value !== UNCONFIGURED &&
        value !== 'false' &&
        value !== '0';
      return truthy ? body : '';
    }
  );

  // 2. Replace {{VARIABLE}} with values
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return vars[key] ?? UNCONFIGURED;
  });

  return result;
}

/**
 * Build a full TemplateVars object from a partial input, filling defaults.
 */
export function buildVars(
  partial: Partial<TemplateVars>,
  projectName: string,
  sddVersion: string
): TemplateVars {
  const base: TemplateVars = {
    LANGUAGE: UNCONFIGURED,
    FRONTEND_FRAMEWORK: UNCONFIGURED,
    BACKEND_FRAMEWORK: UNCONFIGURED,
    DATABASE: UNCONFIGURED,
    DEPLOYMENT: UNCONFIGURED,
    CICD: UNCONFIGURED,
    PROJECT_NAME: projectName,
    SDD_VERSION: sddVersion,
  };

  const merged: TemplateVars = { ...base, ...partial } as TemplateVars;

  // STACK_UNCONFIGURED = true when all stack fields are still [not configured]
  const stackFields = ['LANGUAGE', 'FRONTEND_FRAMEWORK', 'BACKEND_FRAMEWORK', 'DATABASE'] as const;
  const allUnconfigured = stackFields.every((f) => merged[f] === UNCONFIGURED);
  merged['STACK_UNCONFIGURED'] = allUnconfigured ? 'true' : '';

  return merged;
}

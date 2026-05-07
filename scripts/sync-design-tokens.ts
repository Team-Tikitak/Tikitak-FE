import { mkdir, writeFile } from 'node:fs/promises';

const DEFAULT_OWNER = 'Team-Tikitak';
const DEFAULT_REPO = 'Tikitak-DesignSystem';
const DEFAULT_PATH = 'design/tokens.json';
const DEFAULT_REF = 'design';
const RAW_OUTPUT = 'tokens/tokens.studio.json';
const STYLE_DICTIONARY_OUTPUT = 'tokens/tokens.json';
const GITHUB_API_HOST = 'api.github.com';

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, '');
}

const token = cleanEnvValue(
  process.env.DESIGN_TOKENS_TOKEN ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN,
);
const owner = process.env.DESIGN_TOKENS_OWNER ?? DEFAULT_OWNER;
const repo = process.env.DESIGN_TOKENS_REPO ?? DEFAULT_REPO;
const path = process.env.DESIGN_TOKENS_PATH ?? DEFAULT_PATH;
const ref = process.env.DESIGN_TOKENS_REF ?? DEFAULT_REF;

const url =
  process.env.DESIGN_TOKENS_URL ??
  `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;

type TokenTree = Record<string, unknown>;

type TokenNode = {
  type?: string;
  value: unknown;
  comment?: string;
};

async function fetchDesignTokens() {
  const tokenUrl = new URL(url);
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'tikitak-design-token-sync',
  };

  if (token && tokenUrl.hostname === GITHUB_API_HOST) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(tokenUrl, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch design tokens: ${response.status} ${response.statusText}`);
  }

  if (tokenUrl.hostname === GITHUB_API_HOST && tokenUrl.pathname.startsWith('/repos/')) {
    const payload = (await response.json()) as { content?: string };

    if (!payload.content) {
      throw new Error('GitHub contents API response did not include file content.');
    }

    return JSON.parse(Buffer.from(payload.content, 'base64').toString('utf8')) as TokenTree;
  }

  return (await response.json()) as TokenTree;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function ensureCompatibilityAliases(tokens: TokenTree) {
  const fontWeights = asRecord(tokens.fontWeights);
  const colors = asRecord(tokens.colors);

  if (!fontWeights) {
    tokens.fontWeights = {};
  }

  if (!colors) {
    tokens.colors = {};
  }

  const ensuredFontWeights = tokens.fontWeights as Record<string, unknown>;

  if (!ensuredFontWeights.titleBold && ensuredFontWeights.headingBold) {
    ensuredFontWeights.titleBold = {
      type: 'fontWeights',
      value: '{fontWeights.headingBold}',
    };
  }

  if (!ensuredFontWeights.bodyMedium) {
    ensuredFontWeights.bodyMedium = {
      type: 'fontWeights',
      value: 'Medium',
    };
  }

  const ensuredColors = tokens.colors as Record<string, unknown>;

  if (!ensuredColors.main) {
    ensuredColors.main = {
      '000': {
        type: 'color',
        value: '#ebf8fe',
      },
      '001': {
        type: 'color',
        value: '#38bdf8',
      },
      '002': {
        type: 'color',
        value: '#0680b6',
      },
    };
  }

  if (!ensuredColors.red) {
    ensuredColors.red = {
      '100': {
        type: 'color',
        value: '#fff5f5',
      },
      '200': {
        type: 'color',
        value: '#fed7d7',
      },
      '300': {
        type: 'color',
        value: '#feb2b2',
      },
      '400': {
        type: 'color',
        value: '#fc8181',
      },
      '500': {
        type: 'color',
        value: '#f56565',
      },
      '600': {
        type: 'color',
        value: '#e53e3e',
      },
      '700': {
        type: 'color',
        value: '#c53030',
      },
      '800': {
        type: 'color',
        value: '#9b2c2c',
      },
      '900': {
        type: 'color',
        value: '#742a2a',
      },
    };
  }
}

function normalizeTokenShape(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeTokenShape);
  }

  const record = asRecord(value);

  if (!record) {
    return value;
  }

  const output: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(record)) {
    if (key === '$value') {
      output.value = normalizeTokenShape(child);
      continue;
    }

    if (key === '$type') {
      output.type = child;
      continue;
    }

    if (key === '$description') {
      output.comment = child;
      continue;
    }

    if (key.startsWith('$')) {
      continue;
    }

    output[key] = normalizeTokenShape(child);
  }

  return output;
}

function isToken(value: unknown): value is TokenNode {
  return Boolean(asRecord(value) && Object.hasOwn(value as Record<string, unknown>, 'value'));
}

function getByPath(tokens: TokenTree, referencePath: string) {
  return referencePath
    .split('.')
    .reduce<unknown>((current, part) => asRecord(current)?.[part], tokens);
}

function isNumericExpressionPart(value: string) {
  return /^-?\d+(\.\d+)?$/.test(value.trim());
}

function evaluateArithmetic(value: string) {
  const parts = value.split(/\s*\*\s*/).map((part) => part.trim());

  // Keep token math intentionally narrow to avoid dynamic code execution.
  if (parts.length < 2 || parts.some((part) => !isNumericExpressionPart(part))) {
    return value;
  }

  return parts.reduce((result, part) => result * Number(part), 1);
}

function resolveTokenValue(tokens: TokenTree, value: unknown, stack: string[] = []): unknown {
  if (Array.isArray(value)) {
    return value.map((child) => resolveTokenValue(tokens, child, stack));
  }

  const record = asRecord(value);

  if (record) {
    return Object.fromEntries(
      Object.entries(record).map(([key, child]) => [key, resolveTokenValue(tokens, child, stack)]),
    );
  }

  if (typeof value !== 'string') {
    return value;
  }

  const referencePattern = /\{([^}]+)\}/g;
  const references = [...value.matchAll(referencePattern)];

  if (references.length === 0) {
    return value;
  }

  const resolveReference = (referencePath: string) => {
    if (stack.includes(referencePath)) {
      throw new Error(`Circular token reference: ${[...stack, referencePath].join(' -> ')}`);
    }

    const target = getByPath(tokens, referencePath);

    if (!isToken(target)) {
      throw new Error(`Unresolved token reference: {${referencePath}}`);
    }

    return resolveTokenValue(tokens, target.value, [...stack, referencePath]);
  };

  if (references.length === 1 && references[0]?.[0] === value) {
    return resolveReference(references[0][1]);
  }

  const replaced = value.replace(referencePattern, (_, referencePath: string) => {
    const resolved = resolveReference(referencePath);
    return typeof resolved === 'number' ? String(resolved) : String(resolved);
  });

  return evaluateArithmetic(replaced);
}

function resolveAllTokenValues(tokens: TokenTree) {
  function visit(node: unknown) {
    const record = asRecord(node);

    if (!record) {
      return;
    }

    if (isToken(record)) {
      record.value = resolveTokenValue(tokens, record.value);
      return;
    }

    for (const child of Object.values(record)) {
      visit(child);
    }
  }

  visit(tokens);
}

const rawTokens = await fetchDesignTokens();
const rawTokensRecord = asRecord(rawTokens);
const tokenSet = clone((asRecord(rawTokensRecord?.core) ?? rawTokens) as TokenTree);
const normalizedTokens = normalizeTokenShape(tokenSet) as TokenTree;

ensureCompatibilityAliases(normalizedTokens);
resolveAllTokenValues(normalizedTokens);

await mkdir('tokens', { recursive: true });
await writeFile(RAW_OUTPUT, `${JSON.stringify(rawTokens, null, 2)}\n`, 'utf8');
await writeFile(STYLE_DICTIONARY_OUTPUT, `${JSON.stringify(normalizedTokens, null, 2)}\n`, 'utf8');

console.log(`Synced design tokens from ${owner}/${repo}:${path}`);
console.log(`- ${RAW_OUTPUT}`);
console.log(`- ${STYLE_DICTIONARY_OUTPUT}`);

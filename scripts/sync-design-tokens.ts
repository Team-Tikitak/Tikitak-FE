import { mkdir, writeFile } from 'node:fs/promises';

const DEFAULT_OWNER = 'Team-Tikitak';
const DEFAULT_REPO = 'Tikitak-DesignSystem';
const DEFAULT_PATH = 'design/tokens.json';
const DEFAULT_REF = 'design';
const RAW_OUTPUT = 'tokens/tokens.studio.json';
const STYLE_DICTIONARY_OUTPUT = 'tokens/tokens.json';

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
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'tikitak-design-token-sync',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch design tokens: ${response.status} ${response.statusText}`);
  }

  if (url.includes('api.github.com/repos/')) {
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

  if (!fontWeights) {
    tokens.fontWeights = {};
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

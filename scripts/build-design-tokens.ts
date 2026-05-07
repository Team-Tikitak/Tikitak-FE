import StyleDictionary from 'style-dictionary';
import { transformTypes } from 'style-dictionary/enums';
import config from '../style-dictionary.config.js';

type StyleDictionaryToken = {
  path: string[];
  value: unknown;
};

type ShadowTokenValue = {
  color: string;
  x: number | string;
  y: number | string;
  blur: number | string;
  spread: number | string;
};

type TypographyTokenValue = {
  fontWeight: string | number;
  fontSize: string | number;
  lineHeight: string | number;
  letterSpacing: string | number;
};

function byPath(tokens: StyleDictionaryToken[]) {
  const map = new Map<string, StyleDictionaryToken>();

  for (const token of tokens) {
    map.set(token.path.join('.'), token);
  }

  return map;
}

function getToken(tokenMap: Map<string, StyleDictionaryToken>, path: string) {
  return tokenMap.get(path)?.value;
}

function toKebab(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function toCssLength(value: unknown) {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  return value
    .split(/\s+/)
    .map((part) => (/^-?\d+(\.\d+)?$/.test(part) ? `${part}px` : part))
    .join(' ');
}

function toCssOpacity(value: unknown) {
  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string' && value.endsWith('%')) {
    return String(Number.parseFloat(value) / 100);
  }

  return String(value);
}

function toCssLetterSpacing(value: unknown) {
  if (typeof value === 'number') {
    return value === 0 ? '0' : `${value}px`;
  }

  if (typeof value === 'string' && value.endsWith('%')) {
    const emValue = Number.parseFloat(value) / 100;
    return emValue === 0 ? '0' : `${emValue}em`;
  }

  return String(value);
}

function toCssFontFamily(value: unknown) {
  return `'${String(value)}', sans-serif`;
}

function toCssFontWeight(value: unknown) {
  const weights: Record<string, number> = {
    Regular: 400,
    Medium: 500,
    SemiBold: 600,
    Bold: 700,
  };

  return String(weights[String(value)] ?? value);
}

function isShadowValue(value: unknown): value is ShadowTokenValue {
  return Boolean(value && typeof value === 'object' && 'color' in value);
}

function isTypographyValue(value: unknown): value is TypographyTokenValue {
  return Boolean(value && typeof value === 'object' && 'fontWeight' in value);
}

function toCssShadow(value: unknown) {
  if (!isShadowValue(value)) {
    return String(value);
  }

  return `${toCssLength(value.x)} ${toCssLength(value.y)} ${toCssLength(value.blur)} ${toCssLength(
    value.spread,
  )} ${value.color}`;
}

function cssDeclaration(name: string, value: unknown) {
  return `  ${name}: ${String(value)};`;
}

function tokenDeclarations(allTokens: StyleDictionaryToken[]) {
  const declarations: string[] = [];

  for (const token of allTokens) {
    const [category, ...rest] = token.path;

    if (!category || rest.length === 0 || ['title', 'button', 'body'].includes(category)) {
      continue;
    }

    const suffix = rest.map(toKebab).join('-');

    if (category === 'colors') {
      declarations.push(cssDeclaration(`--color-${suffix}`, token.value));
      continue;
    }

    if (category === 'dimension') {
      declarations.push(
        cssDeclaration(
          `--dimension-${suffix}`,
          suffix === 'scale' ? token.value : toCssLength(token.value),
        ),
      );
      continue;
    }

    if (category === 'spacing') {
      declarations.push(cssDeclaration(`--spacing-${suffix}`, toCssLength(token.value)));
      continue;
    }

    if (category === 'borderRadius') {
      declarations.push(cssDeclaration(`--radius-${suffix}`, toCssLength(token.value)));
      continue;
    }

    if (category === 'opacity') {
      declarations.push(cssDeclaration(`--opacity-${suffix}`, toCssOpacity(token.value)));
      continue;
    }

    if (category === 'fontFamilies') {
      declarations.push(cssDeclaration(`--font-${suffix}`, toCssFontFamily(token.value)));
      continue;
    }

    if (category === 'fontSize') {
      declarations.push(cssDeclaration(`--text-${suffix}`, toCssLength(token.value)));
      continue;
    }

    if (category === 'lineHeights') {
      declarations.push(cssDeclaration(`--leading-${suffix}`, token.value));
      continue;
    }

    if (category === 'letterSpacing') {
      declarations.push(cssDeclaration(`--tracking-${suffix}`, toCssLetterSpacing(token.value)));
      continue;
    }

    if (category === 'boxshadow') {
      declarations.push(cssDeclaration(`--shadow-${suffix}`, toCssShadow(token.value)));
    }
  }

  declarations.push('');
  declarations.push('  --text-h1: var(--text-5);');
  declarations.push('  --text-h2: var(--text-4);');
  declarations.push('  --text-h3: var(--text-3);');
  declarations.push('  --text-h4: var(--text-2);');
  declarations.push('  --text-h5: var(--text-1);');
  declarations.push('  --text-h6: var(--text-0);');
  declarations.push('  --dimension-max: 999px;');
  declarations.push('  --radius-max: 999px;');
  declarations.push('');
  declarations.push('  --color-main-000: #ebf8fe;');
  declarations.push('  --color-main-001: #38bdf8;');
  declarations.push('  --color-main-002: #0680b6;');
  declarations.push('  --color-main: var(--color-main-001);');
  declarations.push('');
  declarations.push('  --color-red-100: #fff5f5;');
  declarations.push('  --color-red-200: #fed7d7;');
  declarations.push('  --color-red-300: #feb2b2;');
  declarations.push('  --color-red-400: #fc8181;');
  declarations.push('  --color-red-500: #f56565;');
  declarations.push('  --color-red-600: #e53e3e;');
  declarations.push('  --color-red-700: #c53030;');
  declarations.push('  --color-red-800: #9b2c2c;');
  declarations.push('  --color-red-900: #742a2a;');

  return declarations;
}

function typographyUtilities(allTokens: StyleDictionaryToken[]) {
  const utilities: string[] = [];
  const tokenMap = byPath(allTokens);

  for (const token of allTokens) {
    const [category, name] = token.path;

    if (
      !category ||
      !name ||
      !['title', 'button', 'body'].includes(category) ||
      !isTypographyValue(token.value)
    ) {
      continue;
    }

    const utilityName = `${category}-${name.replace(category, '')}`;
    const fontFamily = category === 'body' ? 'var(--font-body)' : 'var(--font-title)';
    const fontWeight = toCssFontWeight(token.value.fontWeight);
    const fontSize = toCssLength(token.value.fontSize);
    const lineHeight = token.value.lineHeight;
    const letterSpacing = toCssLetterSpacing(token.value.letterSpacing);

    utilities.push(`@utility ${utilityName} {`);
    utilities.push(`  font-family: ${fontFamily};`);
    utilities.push(`  font-weight: ${fontWeight};`);
    utilities.push(`  font-size: ${fontSize};`);
    utilities.push(`  line-height: ${lineHeight};`);
    utilities.push(`  letter-spacing: ${letterSpacing};`);
    utilities.push('}');
    utilities.push('');
  }

  if (!getToken(tokenMap, 'body.body10')) {
    utilities.push('@utility body-10 {');
    utilities.push('  font-family: var(--font-body);');
    utilities.push('  font-weight: 400;');
    utilities.push('  font-size: var(--text-2);');
    utilities.push('  line-height: var(--leading-2);');
    utilities.push('  letter-spacing: var(--tracking-5);');
    utilities.push('}');
    utilities.push('');
  }

  if (!getToken(tokenMap, 'button.button7')) {
    utilities.push('@utility button-7 {');
    utilities.push('  font-family: var(--font-title);');
    utilities.push('  font-weight: 600;');
    utilities.push('  font-size: var(--text-3);');
    utilities.push('  line-height: var(--leading-2);');
    utilities.push('  letter-spacing: var(--tracking-5);');
    utilities.push('}');
    utilities.push('');
  }

  return utilities;
}

StyleDictionary.registerFormat({
  name: 'tikitak/tailwind-v4-css',
  format: ({ dictionary }) => {
    const allTokens = dictionary.allTokens as StyleDictionaryToken[];
    const lines = [
      '/* This file is generated by `yarn tokens:build`. Do not edit manually. */',
      '',
      '@theme {',
      ...tokenDeclarations(allTokens),
      '}',
      '',
      '/* ===== typography utilities ===== */',
      '',
      ...typographyUtilities(allTokens),
    ];

    return `${lines.join('\n').trimEnd()}\n`;
  },
});

StyleDictionary.registerTransform({
  name: 'name/tikitak-path-kebab',
  type: transformTypes.name,
  transform: (token) => token.path.map(toKebab).join('-'),
});

const styleDictionary = new StyleDictionary(config);

await styleDictionary.buildAllPlatforms();

const INVITE_LINK_HOST = 'app.tikitak.space';

export const parseInviteToken = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    if (parsed.protocol === 'https:' && parsed.hostname === INVITE_LINK_HOST) {
      const pathMatch = parsed.pathname.match(/^\/invite\/([^/]+)/);
      if (pathMatch) return decodeURIComponent(pathMatch[1]);
    }

    if (parsed.protocol === 'tikitak:' && parsed.hostname === 'invite') {
      const [segment] = parsed.pathname.replace(/^\//, '').split('/');
      if (segment) return decodeURIComponent(segment);
    }

    return null;
  } catch {
    return null;
  }
};

export const getInviteAcceptPathFromUrl = (url: string): string | null => {
  const token = parseInviteToken(url);
  return token ? `/invite/${encodeURIComponent(token)}` : null;
};

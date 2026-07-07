import { toInviteAccept } from '@/app/routes/paths';

export const parseInviteToken = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Universal Link: https://app.tikitak.space/invite/<token>
    const pathMatch = parsed.pathname.match(/^\/invite\/([^/]+)/);
    if (pathMatch) return decodeURIComponent(pathMatch[1]);
    // Custom scheme: tikitak://invite/<token> (host='invite', pathname='/<token>')
    if (parsed.hostname === 'invite') {
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
  return token ? toInviteAccept(token) : null;
};

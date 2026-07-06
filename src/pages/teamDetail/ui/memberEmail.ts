const APPLE_PRIVATE_RELAY_DOMAIN = 'privaterelay.appleid.com';
const PRIVATE_EMAIL_LABEL = '이메일 비공개';

export const isApplePrivateRelayEmail = (email: string | null | undefined): boolean =>
  email?.trim().toLowerCase().endsWith(`@${APPLE_PRIVATE_RELAY_DOMAIN}`) ?? false;

export const formatMemberEmail = (email: string | null | undefined): string =>
  isApplePrivateRelayEmail(email) ? PRIVATE_EMAIL_LABEL : (email ?? '');

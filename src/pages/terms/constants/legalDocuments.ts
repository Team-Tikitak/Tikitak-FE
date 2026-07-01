import { PRIVACY_POLICY } from './privacyPolicy';
import { TERMS_OF_SERVICE } from './termsOfService';

export type LegalDocType = 'service' | 'privacy';

export type LegalListItem =
  | string
  | { text: string; url: string; urlLabel?: string; phone?: string };

export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: LegalListItem[] }
  | { type: 'note'; text: string };

export interface LegalDocSection {
  id: string;
  heading?: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  intro?: string;
  meta?: string[];
  sections: LegalDocSection[];
  footer?: string[];
}

export const LEGAL_DOCS: Record<LegalDocType, LegalDoc> = {
  service: TERMS_OF_SERVICE,
  privacy: PRIVACY_POLICY,
};

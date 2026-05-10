import { useState } from 'react';
import type { TermsKey, TermsState } from '../model/types';

const INITIAL_TERMS: TermsState = { service: false, privacy: false };

export const useTermsAgreement = () => {
  const [terms, setTerms] = useState<TermsState>(INITIAL_TERMS);

  const allChecked = terms.service && terms.privacy;

  const toggleAll = () => {
    const next = !allChecked;
    setTerms({ service: next, privacy: next });
  };

  const toggle = (key: TermsKey) => {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return { terms, allChecked, toggleAll, toggle };
};

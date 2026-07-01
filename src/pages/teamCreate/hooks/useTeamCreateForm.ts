import { useState } from 'react';
import type { TeamDraft } from '../model/types';

export const useTeamCreateForm = (initialDraft: Partial<TeamDraft> = {}) => {
  const [name, setName] = useState(initialDraft.name ?? '');
  const [description, setDescription] = useState(initialDraft.description ?? '');

  const isDisabled = !name.trim() || !description.trim();
  const draft: TeamDraft = { name, description };

  return { name, setName, description, setDescription, isDisabled, draft };
};

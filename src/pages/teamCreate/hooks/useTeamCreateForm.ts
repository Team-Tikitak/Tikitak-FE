import { useState } from 'react';
import type { TeamDraft } from '../model/types';

export const useTeamCreateForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isDisabled = !name.trim() || !description.trim();
  const draft: TeamDraft = { name, description };

  return { name, setName, description, setDescription, isDisabled, draft };
};

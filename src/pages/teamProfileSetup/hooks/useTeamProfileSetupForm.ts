import { useState } from 'react';

export const useTeamProfileSetupForm = () => {
  const [nickname, setNickname] = useState('');

  const isDisabled = !nickname.trim();

  return { nickname, setNickname, isDisabled };
};

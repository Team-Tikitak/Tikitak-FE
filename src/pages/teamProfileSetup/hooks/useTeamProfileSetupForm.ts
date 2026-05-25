import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTeamProfileSetupFormOptions {
  initialNickname?: string;
  initialAvatarUrl?: string;
}

export const useTeamProfileSetupForm = ({
  initialNickname = '',
  initialAvatarUrl,
}: UseTeamProfileSetupFormOptions = {}) => {
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [userAvatarPreviewUrl, setUserAvatarPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    previewUrlRef.current = userAvatarPreviewUrl;
  }, [userAvatarPreviewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const setAvatar = useCallback((file: File | null) => {
    setUserAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setAvatarFile(file);
  }, []);

  const displayAvatarUrl = userAvatarPreviewUrl ?? initialAvatarUrl ?? null;
  const isDisabled = !nickname.trim();

  return {
    nickname,
    setNickname,
    avatarFile,
    avatarPreviewUrl: displayAvatarUrl,
    setAvatar,
    isDisabled,
  };
};

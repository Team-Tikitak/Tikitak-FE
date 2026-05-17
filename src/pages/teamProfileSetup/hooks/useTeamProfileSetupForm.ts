import { useCallback, useEffect, useRef, useState } from 'react';

export const useTeamProfileSetupForm = () => {
  const [nickname, setNickname] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    previewUrlRef.current = avatarPreviewUrl;
  }, [avatarPreviewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const setAvatar = useCallback((file: File | null) => {
    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setAvatarFile(file);
  }, []);

  const isDisabled = !nickname.trim();

  return {
    nickname,
    setNickname,
    avatarFile,
    avatarPreviewUrl,
    setAvatar,
    isDisabled,
  };
};

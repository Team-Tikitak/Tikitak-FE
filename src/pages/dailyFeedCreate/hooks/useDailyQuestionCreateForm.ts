import { useEffect, useRef, useState } from 'react';
import { type CapturedPhoto } from '@/pages/camera/hooks/useCamera';

const MAX_CONTENT_LENGTH = 1000;

export const useDailyQuestionCreateForm = () => {
  const [content, setContentRaw] = useState('');
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);

  const photoRef = useRef(photo);
  useEffect(() => {
    photoRef.current = photo;
  }, [photo]);
  useEffect(() => {
    return () => {
      if (photoRef.current) URL.revokeObjectURL(photoRef.current.url);
    };
  }, []);

  const setContent = (next: string) => {
    setContentRaw(next.slice(0, MAX_CONTENT_LENGTH));
  };

  const addPhoto = (captured: CapturedPhoto) => {
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return captured;
    });
  };

  const removePhoto = () => {
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  const isShareDisabled = !photo;

  return {
    content,
    setContent,
    photo,
    addPhoto,
    removePhoto,
    maxContentLength: MAX_CONTENT_LENGTH,
    isShareDisabled,
  };
};

import { useEffect, useRef, useState } from 'react';
import { MAX_FEED_CONTENT_LENGTH } from '@/shared/constants/feed';
import { revokeObjectUrlAfterTransition } from '@/shared/lib';
import type { CapturedPhoto } from '@/shared/types/photo';

export const useDailyQuestionCreateForm = () => {
  const [content, setContentRaw] = useState('');
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);

  const photoRef = useRef(photo);
  useEffect(() => {
    photoRef.current = photo;
  }, [photo]);
  useEffect(() => {
    return () => {
      if (photoRef.current) revokeObjectUrlAfterTransition(photoRef.current.url);
    };
  }, []);

  const setContent = (next: string) => {
    setContentRaw(next.slice(0, MAX_FEED_CONTENT_LENGTH));
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
    maxContentLength: MAX_FEED_CONTENT_LENGTH,
    isShareDisabled,
  };
};

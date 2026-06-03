import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import type { FeedDetailResponse } from '@/shared/api/feed/types';
import { MAX_FEED_CONTENT_LENGTH } from '@/shared/constants/feed';
import { normalizeImageUrl, revokeObjectUrlAfterTransition } from '@/shared/lib';
import type { CapturedPhoto } from '@/shared/types/photo';
import { confirmDiscardChanges } from '@/shared/ui/ConfirmDialog';

export const useDailyFeedEditForm = (feedDetail: FeedDetailResponse) => {
  const navigate = useNavigate();

  const [content, setContentRaw] = useState(feedDetail.content ?? '');
  const initialImage = feedDetail.images[0] ?? null;
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    initialImage?.imageUrl ?? null,
  );
  const [newPhoto, setNewPhoto] = useState<CapturedPhoto | null>(null);

  const snapshotRef = useRef({
    content: feedDetail.content ?? '',
    imageUrl: feedDetail.images[0]?.imageUrl ?? null,
  });

  const newPhotoRef = useRef(newPhoto);
  useEffect(() => {
    newPhotoRef.current = newPhoto;
  }, [newPhoto]);
  useEffect(() => {
    return () => {
      if (newPhotoRef.current) revokeObjectUrlAfterTransition(newPhotoRef.current.url);
    };
  }, []);

  const setContent = (next: string) => setContentRaw(next.slice(0, MAX_FEED_CONTENT_LENGTH));

  const addPhoto = (captured: CapturedPhoto) => {
    setNewPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return captured;
    });
    setExistingImageUrl(null);
  };

  const removePhoto = () => {
    setNewPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setExistingImageUrl(null);
  };

  const currentPhotoUrl =
    newPhoto?.url ?? (existingImageUrl ? (normalizeImageUrl(existingImageUrl) ?? null) : null);

  const existingMediaPublicId = existingImageUrl ? (initialImage?.mediaPublicId ?? null) : null;

  const handleBack = () => {
    const snapshot = snapshotRef.current;
    const isDirty =
      content !== snapshot.content || newPhoto !== null || existingImageUrl !== snapshot.imageUrl;

    if (!isDirty) {
      navigate(-1);
      return;
    }
    confirmDiscardChanges({ onDiscard: () => navigate(-1) });
  };

  return {
    content,
    setContent,
    newPhoto,
    currentPhotoUrl,
    existingMediaPublicId,
    addPhoto,
    removePhoto,
    handleBack,
    maxContentLength: MAX_FEED_CONTENT_LENGTH,
  };
};

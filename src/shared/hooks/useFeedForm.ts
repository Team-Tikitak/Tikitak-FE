import { useEffect, useRef, useState } from 'react';
import type { FeedPlace } from '@/shared/api/feed/types';
import type { TeamMember } from '@/shared/api/team/types';
import { MAX_FEED_CONTENT_LENGTH } from '@/shared/constants/feed';
import { revokeObjectUrlsAfterTransition } from '@/shared/lib';
import type { CapturedPhoto } from '@/shared/types/photo';

export const DEFAULT_MAX_PHOTO_COUNT = 10;
export const MAX_TAGGED_MEMBERS = 11;

interface UseFeedFormOptions {
  maxPhotoCount?: number;
  initialContent?: string;
  initialPlace?: FeedPlace | null;
  initialMembers?: TeamMember[];
}

export const useFeedForm = ({
  maxPhotoCount = DEFAULT_MAX_PHOTO_COUNT,
  initialContent = '',
  initialPlace = null,
  initialMembers = [],
}: UseFeedFormOptions = {}) => {
  const [content, setContentRaw] = useState(initialContent);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<FeedPlace | null>(initialPlace);
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>(initialMembers);

  // 언마운트 시점의 photos를 ref로 참조해 Object URL 해제
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => {
    return () => {
      const urls = photosRef.current.map((photo) => photo.url);
      revokeObjectUrlsAfterTransition(urls);
    };
  }, []);

  const setContent = (next: string) => {
    setContentRaw(next.slice(0, MAX_FEED_CONTENT_LENGTH));
  };

  const addPhoto = (photo: CapturedPhoto) => {
    setPhotos((prev) => (prev.length >= maxPhotoCount ? prev : [...prev, photo]));
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === photoId);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((photo) => photo.id !== photoId);
    });
  };

  const selectPlace = (place: FeedPlace) => {
    setSelectedPlace(place);
  };

  const commitMembers = (members: TeamMember[]) => {
    setSelectedMembers(members.slice(0, MAX_TAGGED_MEMBERS));
  };

  const removeMember = (teamMemberId: number) => {
    setSelectedMembers((prev) => prev.filter((member) => member.teamMemberId !== teamMemberId));
  };

  const canAddMorePhotos = photos.length < maxPhotoCount;
  const isShareDisabled = photos.length === 0;

  return {
    content,
    setContent,
    photos,
    addPhoto,
    removePhoto,
    canAddMorePhotos,
    maxPhotoCount,
    maxContentLength: MAX_FEED_CONTENT_LENGTH,
    selectedPlace,
    selectPlace,
    selectedMembers,
    commitMembers,
    removeMember,
    isShareDisabled,
  };
};

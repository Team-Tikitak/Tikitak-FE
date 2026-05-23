import { useEffect, useRef, useState } from 'react';
import { type CapturedPhoto } from '@/pages/camera/hooks/useCamera';
import type { FeedPlace } from '@/shared/api/feed/types';
import type { TeamMember } from '@/shared/api/team/types';

const MAX_CONTENT_LENGTH = 1000;
const MAX_PHOTO_COUNT = 10;
export const MAX_TAGGED_MEMBERS = 11;

export const useFeedCreateForm = () => {
  const [content, setContentRaw] = useState('');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<FeedPlace | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);

  // 언마운트 시점의 photos를 ref로 참조해 Object URL 해제
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, []);

  const setContent = (next: string) => {
    setContentRaw(next.slice(0, MAX_CONTENT_LENGTH));
  };

  const addPhoto = (photo: CapturedPhoto) => {
    setPhotos((prev) => (prev.length >= MAX_PHOTO_COUNT ? prev : [...prev, photo]));
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

  const canAddMorePhotos = photos.length < MAX_PHOTO_COUNT;
  const isShareDisabled = photos.length === 0;

  return {
    content,
    setContent,
    photos,
    addPhoto,
    removePhoto,
    canAddMorePhotos,
    maxPhotoCount: MAX_PHOTO_COUNT,
    maxContentLength: MAX_CONTENT_LENGTH,
    selectedPlace,
    selectPlace,
    selectedMembers,
    commitMembers,
    removeMember,
    isShareDisabled,
  };
};

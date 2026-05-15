import { useEffect, useRef, useState } from 'react';
import { type CapturedPhoto } from '@/pages/camera/hooks/useCamera';
import { MOCK_LOCATIONS, MOCK_MEMBERS } from '../model/mock';

const MAX_CONTENT_LENGTH = 1000;
const MAX_PHOTO_COUNT = 10;

export const useFeedCreateForm = () => {
  const [content, setContentRaw] = useState('');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // 언마운트 시점의 photos를 ref로 참조해 Object URL 해제 (Hook deps에 photos 안 넣어도 안전)
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

  const selectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
  };

  const commitMembers = (memberIds: string[]) => {
    setSelectedMemberIds(memberIds);
  };

  const removeMember = (memberId: string) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
  };

  const handleShare = () => {
    // TODO: 게시물 작성 API 연동 (photos[].blob을 FormData로 전송)
  };

  const selectedLocationTitle = MOCK_LOCATIONS.find(
    (location) => location.id === selectedLocationId,
  )?.title;
  const selectedMembers = MOCK_MEMBERS.filter((member) => selectedMemberIds.includes(member.id));
  const isShareDisabled = photos.length === 0;
  const canAddMorePhotos = photos.length < MAX_PHOTO_COUNT;

  return {
    content,
    setContent,
    photos,
    canAddMorePhotos,
    addPhoto,
    removePhoto,
    maxPhotoCount: MAX_PHOTO_COUNT,
    maxContentLength: MAX_CONTENT_LENGTH,
    selectedLocationTitle,
    selectedMemberIds,
    selectedMembers,
    selectLocation,
    commitMembers,
    removeMember,
    handleShare,
    isShareDisabled,
  };
};

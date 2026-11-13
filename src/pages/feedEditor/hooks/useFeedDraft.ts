import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { FeedPlace } from '@/shared/api/feed/types';
import type { TeamMember } from '@/shared/api/team/types';
import {
  deleteFeedDraft,
  loadFeedDraft,
  saveFeedDraft,
  type FeedDraft,
} from '@/shared/lib/storage/feedDraftStore';
import type { CapturedPhoto } from '@/shared/types/photo';
import { openConfirmDialog } from '@/shared/ui/ConfirmDialog';

const DRAFT_SAVE_DELAY_MS = 500;

interface FeedDraftForm {
  content: string;
  setContent: (next: string) => void;
  photos: CapturedPhoto[];
  addPhoto: (photo: CapturedPhoto) => void;
  selectedPlace: FeedPlace | null;
  selectPlace: (place: FeedPlace) => void;
  selectedMembers: TeamMember[];
  commitMembers: (members: TeamMember[]) => void;
}

interface UseFeedDraftParams {
  teamId: number;
  form: FeedDraftForm;
  teamMembers: TeamMember[];
  /** 폼에 기본으로 들어가는 함께한 멤버(본인). 이 선택 그대로면 저장할 내용으로 보지 않는다 */
  defaultMemberIds: number[];
}

type DraftValues = Omit<FeedDraft, 'updatedAt'>;

const isSameMembers = (a: number[], b: number[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

// 함께한 멤버는 기본으로 본인이 들어가 있어서, 사용자가 바꿨을 때만 내용으로 본다
const hasDraftContent = (
  { content, place, photos, memberIds }: DraftValues,
  defaultMemberIds: number[],
) =>
  content.trim().length > 0 ||
  place !== null ||
  photos.length > 0 ||
  !isSameMembers(memberIds, defaultMemberIds);

export const useFeedDraft = ({
  teamId,
  form,
  teamMembers,
  defaultMemberIds,
}: UseFeedDraftParams) => {
  // 이어쓰기 여부를 정하기 전에는 저장하지 않는다. 빈 폼으로 기존 임시저장본을 덮어쓰지 않기 위해서다
  const [isDecided, setIsDecided] = useState(false);
  const finishedRef = useRef(false);
  const pendingRef = useRef(false);
  // 이 화면에서 저장했거나 이어쓴 임시저장본이 있을 때만, 내용을 모두 지우면 임시저장본도 지운다
  const ownsDraftRef = useRef(false);

  const { content, photos, selectedPlace, selectedMembers } = form;
  const draftRef = useRef<DraftValues | null>(null);

  const restore = useEffectEvent((saved: FeedDraft) => {
    form.setContent(saved.content);
    if (saved.place) form.selectPlace(saved.place);
    form.commitMembers(
      saved.memberIds
        .map((id) => teamMembers.find((member) => member.teamMemberId === id))
        .filter((member): member is TeamMember => member !== undefined),
    );
    saved.photos.forEach(({ id, blob }) =>
      form.addPhoto({ id, blob, url: URL.createObjectURL(blob) }),
    );
  });

  const isWorthRestoring = useEffectEvent(
    (saved: FeedDraft | null): saved is FeedDraft =>
      saved !== null && hasDraftContent(saved, defaultMemberIds),
  );

  useEffect(() => {
    let cancelled = false;
    void loadFeedDraft(teamId).then((saved) => {
      if (cancelled) return;
      if (!isWorthRestoring(saved)) {
        setIsDecided(true);
        return;
      }
      openConfirmDialog({
        title: '작성 중인 글이 있어요',
        description: '이어서 작성할까요?',
        confirmLabel: '이어쓰기',
        cancelLabel: '새로 쓰기',
        onConfirm: () => {
          restore(saved);
          ownsDraftRef.current = true;
          setIsDecided(true);
        },
        // Android 네이티브 확인창은 뒤로가기·바깥 탭으로 닫혀도 여기로 온다.
        // 그래서 바로 지우지 않고 빈 폼으로 시작해, 새 내용을 입력할 때 덮어쓴다
        onCancel: () => setIsDecided(true),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const persistLatest = useEffectEvent(() => {
    pendingRef.current = false;
    const latest = draftRef.current;
    if (finishedRef.current || !latest) return;
    if (hasDraftContent(latest, defaultMemberIds)) {
      ownsDraftRef.current = true;
      void saveFeedDraft(teamId, { ...latest, updatedAt: Date.now() });
    } else if (ownsDraftRef.current) {
      ownsDraftRef.current = false;
      void deleteFeedDraft(teamId);
    }
  });

  useEffect(() => {
    if (!isDecided || finishedRef.current) return;
    draftRef.current = {
      content,
      place: selectedPlace,
      memberIds: selectedMembers.map((member) => member.teamMemberId),
      photos: photos.map(({ id, blob }) => ({ id, blob })),
    };
    pendingRef.current = true;
    const timer = window.setTimeout(() => persistLatest(), DRAFT_SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isDecided, content, photos, selectedPlace, selectedMembers]);

  // 저장 대기 중에 화면을 떠나도 마지막 입력을 남긴다
  useEffect(
    () => () => {
      if (pendingRef.current) persistLatest();
    },
    [],
  );

  // 공유에 성공하면 임시저장본을 지우고 이후 저장을 막는다
  const discardDraft = () => {
    finishedRef.current = true;
    pendingRef.current = false;
    void deleteFeedDraft(teamId);
  };

  return { discardDraft };
};

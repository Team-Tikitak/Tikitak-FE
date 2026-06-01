import type { TeamMember } from '@/shared/api/team/types';
import { MAX_TAGGED_MEMBERS } from '@/shared/hooks/useFeedForm';
import { normalizeImageUrl } from '@/shared/lib';
import {
  BottomSheetOverlay,
  MemberSelectSheet,
  type MemberSelectSheetItem,
} from '@/shared/ui/BottomSheet';

interface MemberSelectOverlayProps {
  open: boolean;
  onClose: () => void;
  onExitComplete: () => void;
  teamMembers: TeamMember[];
  selectedMembers: TeamMember[];
  onConfirm: (members: TeamMember[]) => void;
}

export const MemberSelectOverlay = ({
  open,
  onClose,
  onExitComplete,
  teamMembers,
  selectedMembers,
  onConfirm,
}: MemberSelectOverlayProps) => {
  const items: MemberSelectSheetItem[] = teamMembers.map((member) => ({
    id: String(member.teamMemberId),
    name: member.nickname,
    avatarSrc: normalizeImageUrl(member.profileImgUrl),
  }));
  const initialSelectedIds = selectedMembers.map((member) => String(member.teamMemberId));

  return (
    <BottomSheetOverlay
      open={open}
      onClose={onClose}
      onExitComplete={onExitComplete}
      ariaTitle="인원 추가"
      ariaDescription="이번 게시물에 함께한 인원을 선택하세요"
    >
      <MemberSelectSheet
        members={items}
        initialSelectedIds={initialSelectedIds}
        maxSelection={MAX_TAGGED_MEMBERS}
        onConfirm={(memberIds) => {
          const idSet = new Set(memberIds);
          const picked = teamMembers.filter((member) => idSet.has(String(member.teamMemberId)));
          onConfirm(picked);
        }}
      />
    </BottomSheetOverlay>
  );
};

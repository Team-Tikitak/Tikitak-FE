import { normalizeImageUrl } from '@/shared/lib';

interface MyProfileCardProps {
  nickname?: string;
  profileImgUrl?: string | null;
  onEdit: () => void;
}

export const MyProfileCard = ({ nickname, profileImgUrl, onEdit }: MyProfileCardProps) => {
  return (
    <div className="bg-main-000 flex items-center gap-3 rounded-lg p-4">
      <img
        src={normalizeImageUrl(profileImgUrl)}
        alt={nickname}
        className="no-native-image size-10 rounded-full"
      />
      <h3 className="body-9 text-gray-900">{nickname}</h3>
      <button
        aria-label="프로필 변경"
        className="body-4 text-main-001 ml-auto cursor-pointer"
        onClick={onEdit}
      >
        변경
      </button>
    </div>
  );
};

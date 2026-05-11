export const useTeamInvite = () => {
  const teamName = '스핀기타'; // TODO: 서버에서 받아올 팀 이름
  const inviteUrl = `http://tikitak.com/invite/test-invite-token`; // TODO: 서버에서 받아올 초대 URL

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      // TODO: 사용자 피드백 처리 추가
    }
  };

  return { teamName, inviteUrl, handleCopy };
};

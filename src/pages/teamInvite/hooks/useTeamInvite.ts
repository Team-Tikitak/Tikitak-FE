export const useTeamInvite = () => {
  const teamName = '스핀기타'; // TODO: 서버에서 받아올 팀 이름
  const inviteUrl = `http://tikitak.com/invite/test-invite-token`; // TODO: 서버에서 받아올 초대 URL

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
  };

  return { teamName, inviteUrl, handleCopy };
};

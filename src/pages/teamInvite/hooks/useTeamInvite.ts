export const useTeamInvite = () => {
  const teamName = '스핀기타'; // TODO: 서버에서 받아올 팀 이름
  // TODO: 초대 생성 API 연결 시 응답으로 받은 URL만 이 값에 주입하면 QR/복사가 함께 갱신됩니다.
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

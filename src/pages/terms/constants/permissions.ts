export const PERMISSIONS = [
  { key: 'location', name: '위치', description: '내 주변 기록과 지도 표시에 사용해요.' },
  { key: 'camera', name: '카메라', description: '게시물 업로드 중 사진 촬영 시 사용해요.' },
  { key: 'photos', name: '사진 접근', description: '앨범에서 사진을 불러올 때 사용해요.' },
  { key: 'notifications', name: '알림', description: '댓글과 오늘의 질문 소식 알림을 받아요.' },
] as const;

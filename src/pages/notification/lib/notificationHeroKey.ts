/** 같은 피드 알림이 여러 개면 feedId만으론 히어로 키가 중복되므로(ssgoi는 첫 요소만 매칭) 알림 id를 섞어 유니크하게 만든다 */
export const notificationHeroKey = (feedId: number, notificationId: number): string =>
  `pin-${feedId}-n${notificationId}`;

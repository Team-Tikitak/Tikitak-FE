export type BottomSheetSnapPoint = number | string;

/** vaul 스냅 포인트를 CSS height로 변환 — px 문자열은 그대로, 숫자(뷰포트 비율 0~1)는 %로 환산 */
export function snapPointToHeight(snapPoint: BottomSheetSnapPoint | null): string | undefined {
  if (snapPoint === null) return undefined;
  return typeof snapPoint === 'number' ? `${snapPoint * 100}%` : snapPoint;
}

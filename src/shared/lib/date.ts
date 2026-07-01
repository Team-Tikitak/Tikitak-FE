const KST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** ISO 문자열을 "YYYY.MM.DD"로 변환 */
export const formatYmd = (iso: string) => iso.slice(0, 10).replaceAll('-', '.');

/**
 * ISO 문자열을 상대시간으로 변환.
 * "방금 전 / N분 전 / N시간 전 / N일 전" 으로, 7일 이상이면 "YYYY.MM.DD".
 */
export const formatRelativeTime = (iso: string, now: Date = new Date()): string => {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return '';

  const diffSec = Math.floor((now.getTime() - target.getTime()) / 1000);
  if (diffSec < 60) return '방금 전';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  return formatYmd(iso);
};

/** KST 기준 오늘 날짜를 "YYYY-MM-DD"로 반환 */
export const getTodayKstDate = () => KST_DATE_FORMATTER.format(new Date());

/** 주어진 날짜가 KST 기준 오늘인지 여부 */
export const isTodayKstDate = (date: string | null | undefined) => {
  if (!date) return false;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;
  return KST_DATE_FORMATTER.format(parsed) === getTodayKstDate();
};

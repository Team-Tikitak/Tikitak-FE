const KST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const TIMEZONE_SUFFIX_RE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/** 서버 날짜 문자열을 Date로 파싱. 타임존 표기 없는 값은 UTC로 해석(로컬 해석 시 9시간 어긋남) */
export const parseServerDate = (value: string): Date => {
  const truncated = value.replace(/(\.\d{3})\d+/, '$1');
  return new Date(TIMEZONE_SUFFIX_RE.test(truncated) ? truncated : `${truncated}Z`);
};

/** 서버 날짜 문자열을 KST 기준 "YYYY.MM.DD"로 변환. 날짜만 있는 값은 그대로 표기 */
export const formatYmd = (iso: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.replaceAll('-', '.');
  const parsed = parseServerDate(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  return KST_DATE_FORMATTER.format(parsed).replaceAll('-', '.');
};

/** 상대시간("방금 전/N분 전/N시간 전/N일 전")으로 변환, 7일 이상이면 KST 기준 "YYYY.MM.DD" */
export const formatRelativeTime = (iso: string, now: Date = new Date()): string => {
  const target = parseServerDate(iso);
  if (Number.isNaN(target.getTime())) return '';

  const diffSec = Math.floor((now.getTime() - target.getTime()) / 1000);
  if (diffSec < 60) return '방금 전';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  return KST_DATE_FORMATTER.format(target).replaceAll('-', '.');
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

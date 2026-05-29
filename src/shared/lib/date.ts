const KST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** ISO 문자열을 "YYYY.MM.DD"로 변환 */
export const formatYmd = (iso: string) => iso.slice(0, 10).replaceAll('-', '.');

/** KST 기준 오늘 날짜를 "YYYY-MM-DD"로 반환 */
export const getTodayKstDate = () => KST_DATE_FORMATTER.format(new Date());

/** 주어진 날짜가 KST 기준 오늘인지 여부 */
export const isTodayKstDate = (date: string | null | undefined) => {
  if (!date) return false;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;
  return KST_DATE_FORMATTER.format(parsed) === getTodayKstDate();
};

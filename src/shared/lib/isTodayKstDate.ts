const KST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const getTodayKstDate = () => KST_DATE_FORMATTER.format(new Date());

export const isTodayKstDate = (date: string | null | undefined) => {
  if (!date) return false;
  return date.slice(0, 10) === getTodayKstDate();
};

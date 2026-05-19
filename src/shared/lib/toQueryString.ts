type Primitive = string | number | boolean;
type QueryValue = Primitive | Primitive[] | null | undefined;

export const toQueryString = (params?: Record<string, QueryValue>) => {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
    } else {
      search.append(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
};

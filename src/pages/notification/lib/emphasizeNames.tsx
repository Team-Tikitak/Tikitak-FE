import type { ReactNode } from 'react';

const NAME_WITH_SUFFIX_RE = /(\S+)님/g;

/** "ㅎㅇ님이 …" 형태의 알림 문구에서 이름만 볼드 처리. 호칭 "회원님"은 제외 */
export const emphasizeNames = (text: string): ReactNode => {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(NAME_WITH_SUFFIX_RE)) {
    const name = match[1];
    if (name === '회원') continue;
    const start = match.index ?? 0;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    nodes.push(<b key={start}>{name}</b>);
    lastIndex = start + name.length;
  }

  if (nodes.length === 0) return text;
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

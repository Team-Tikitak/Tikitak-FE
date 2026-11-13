import type { FeedPlace } from '@/shared/api/feed/types';

// 사진 Blob을 변환 없이 그대로 담기 위해 IndexedDB를 쓴다 (웹·앱 웹뷰 공통)
const DB_NAME = 'tikitak-feed-draft';
const STORE_NAME = 'drafts';
const DB_VERSION = 1;

export interface FeedDraftPhoto {
  id: string;
  blob: Blob;
}

export interface FeedDraft {
  content: string;
  place: FeedPlace | null;
  memberIds: number[];
  photos: FeedDraftPhoto[];
  updatedAt: number;
}

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runRequest = async <T>(
  mode: IDBTransactionMode,
  createRequest: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = createRequest(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
};

// 임시저장은 실패해도 작성 흐름을 막으면 안 되므로 모든 오류를 삼킨다
export const loadFeedDraft = async (teamId: number): Promise<FeedDraft | null> => {
  try {
    const draft = await runRequest<FeedDraft | undefined>('readonly', (store) => store.get(teamId));
    return draft ?? null;
  } catch {
    return null;
  }
};

export const saveFeedDraft = async (teamId: number, draft: FeedDraft) => {
  try {
    await runRequest('readwrite', (store) => store.put(draft, teamId));
  } catch {
    // 저장 공간 부족·비공개 모드 등에서는 임시저장 없이 진행한다
  }
};

export const deleteFeedDraft = async (teamId: number) => {
  try {
    await runRequest('readwrite', (store) => store.delete(teamId));
  } catch {
    // 지울 수 없으면 다음 진입 때 이어쓰기 확인창이 한 번 더 뜰 뿐이다
  }
};

export const clearFeedDrafts = async () => {
  try {
    await runRequest('readwrite', (store) => store.clear());
  } catch {
    // 위와 동일
  }
};

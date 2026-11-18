import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경변수가 없으면 리더보드를 쓰지 않는다 (로컬·PR 환경에서 요청이 나가지 않게)
export const isGameServerConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// 메인 API(instance)와 분리: 토큰 첨부·401 갱신 인터셉터가 붙으면 안 된다
export const gameInstance = axios.create({
  baseURL: SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : undefined,
  timeout: 10000,
  headers: {
    apikey: SUPABASE_ANON_KEY ?? '',
    // 기존 anon 키(JWT)만 Bearer로도 보낸다. 새 sb_publishable_ 키는 JWT가 아니라 apikey 헤더만 쓴다.
    ...(SUPABASE_ANON_KEY?.startsWith('eyJ') && { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }),
    'Content-Type': 'application/json',
  },
});

import type { LocationSearchSheetItem, MemberSelectSheetItem } from '@/shared/ui/BottomSheet';

export const MOCK_LOCATIONS = [
  { id: 'loc-1', title: '망원동 센토브', description: '서울 마포구 망원동 415-3' },
  { id: 'loc-2', title: '마포한강공원', description: '서울 마포구 마포나루길 467' },
  { id: 'loc-3', title: '홍대입구역 9번 출구', description: '서울 마포구 양화로 지하 160' },
  { id: 'loc-4', title: '공덕역 1번 출구', description: '서울 마포구 만리재로 지하 30' },
  { id: 'loc-5', title: '강남역 11번 출구', description: '서울 강남구 강남대로 지하 396' },
  { id: 'loc-6', title: '성수동 카페거리', description: '서울 성동구 성수이로 일대' },
  { id: 'loc-7', title: '서울숲', description: '서울 성동구 뚝섬로 273' },
  { id: 'loc-8', title: '잠실종합운동장', description: '서울 송파구 올림픽로 25' },
  { id: 'loc-9', title: '광화문광장', description: '서울 종로구 세종로 1-68' },
  { id: 'loc-10', title: '이태원역', description: '서울 용산구 이태원로 지하 177' },
  { id: 'loc-11', title: '연남동 카페거리', description: '서울 마포구 동교로 일대' },
  { id: 'loc-12', title: '북촌한옥마을', description: '서울 종로구 계동길 37' },
  { id: 'loc-13', title: '여의도 IFC몰', description: '서울 영등포구 국제금융로 10' },
  { id: 'loc-14', title: '동대문디자인플라자', description: '서울 중구 을지로 281' },
  { id: 'loc-15', title: '남산서울타워', description: '서울 용산구 남산공원길 105' },
] satisfies LocationSearchSheetItem[];

export const MOCK_MEMBERS = [
  { id: 'm-1', name: '성정수', avatarSrc: 'https://picsum.photos/seed/m1/48' },
  { id: 'm-2', name: '이시언', avatarSrc: 'https://picsum.photos/seed/m2/48' },
  { id: 'm-3', name: '김보규', avatarSrc: 'https://picsum.photos/seed/m3/48' },
  { id: 'm-4', name: '이경준', avatarSrc: 'https://picsum.photos/seed/m4/48' },
  { id: 'm-5', name: '배현우', avatarSrc: 'https://picsum.photos/seed/m5/48' },
  { id: 'm-6', name: '조수진', avatarSrc: 'https://picsum.photos/seed/m6/48' },
  { id: 'm-7', name: '김민경', avatarSrc: 'https://picsum.photos/seed/m7/48' },
  { id: 'm-8', name: '이현진', avatarSrc: 'https://picsum.photos/seed/m8/48' },
] satisfies MemberSelectSheetItem[];

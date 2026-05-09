import type { CommentSheetProps } from './renderers/CommentSheet';
import type { LocationSearchSheetProps } from './renderers/LocationSearchSheet';
import type { MemberSelectSheetProps } from './renderers/MemberSelectSheet';
import type { TeamListSheetProps } from './renderers/TeamListSheet';

export const BOTTOM_SHEET_TYPES = [
  'teamList',
  'comment',
  'locationSearch',
  'memberSelect',
] as const;

export type BottomSheetType = (typeof BOTTOM_SHEET_TYPES)[number];

export type BottomSheetRendererProps =
  | ({ type: 'teamList' } & TeamListSheetProps)
  | ({ type: 'comment' } & CommentSheetProps)
  | ({ type: 'locationSearch' } & LocationSearchSheetProps)
  | ({ type: 'memberSelect' } & MemberSelectSheetProps);

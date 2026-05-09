import { CommentSheet } from './CommentSheet';
import { LocationSearchSheet } from './LocationSearchSheet';
import { MemberSelectSheet } from './MemberSelectSheet';
import { TeamListSheet } from './TeamListSheet';
import type { BottomSheetRendererProps } from '../BottomSheet.types';

const assertNever = (value: never): never => {
  throw new Error(`Unsupported bottom sheet type: ${String(value)}`);
};

export function BottomSheetRenderer(props: BottomSheetRendererProps) {
  switch (props.type) {
    case 'teamList': {
      const { type: _type, ...sheetProps } = props;
      return <TeamListSheet {...sheetProps} />;
    }
    case 'comment': {
      const { type: _type, ...sheetProps } = props;
      return <CommentSheet {...sheetProps} />;
    }
    case 'locationSearch': {
      const { type: _type, ...sheetProps } = props;
      return <LocationSearchSheet {...sheetProps} />;
    }
    case 'memberSelect': {
      const { type: _type, ...sheetProps } = props;
      return <MemberSelectSheet {...sheetProps} />;
    }
    default:
      return assertNever(props);
  }
}

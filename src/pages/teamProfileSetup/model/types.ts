export type TeamDraftRouteState =
  | {
      mode: 'create';
      name: string;
      description: string;
    }
  | {
      mode: 'edit';
      teamId: number;
      teamName: string;
    }
  | {
      mode: 'join';
      token: string;
      name: string;
    };

export type SubmitProfile = {
  nickname: string;
  avatarFile: File | null;
  initialProfileImgUrl?: string;
};

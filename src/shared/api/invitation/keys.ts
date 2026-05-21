export const invitationKeys = {
  all: ['invitation'] as const,
  teamLink: (teamId: number) => [...invitationKeys.all, 'team-link', teamId] as const,
  preview: (token: string) => [...invitationKeys.all, 'preview', token] as const,
};

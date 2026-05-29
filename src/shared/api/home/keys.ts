export const homeKeys = {
  all: ['home'] as const,
  regions: (teamId: number) => [...homeKeys.all, 'regions', teamId] as const,
  recommendedPlace: (teamId: number) => [...homeKeys.all, 'recommendedPlace', teamId] as const,
  everyonePick: (teamId: number) => [...homeKeys.all, 'everyonePick', teamId] as const,
  combinations: (teamId: number) => [...homeKeys.all, 'combinations', teamId] as const,
  bestAttendance: (teamId: number) => [...homeKeys.all, 'bestAttendance', teamId] as const,
  allTagged: (teamId: number) => [...homeKeys.all, 'allTagged', teamId] as const,
};

export const BOTTOM_NAVIGATION_TABS = ['home', 'feed', 'my'] as const;

export type BottomNavigationTab = (typeof BOTTOM_NAVIGATION_TABS)[number];

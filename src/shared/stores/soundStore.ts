import { create } from 'zustand';

export const KEY_SWITCHES = ['tok', 'thock', 'clack', 'creamy'] as const;
export type KeySwitch = (typeof KEY_SWITCHES)[number];

const ENABLED_STORAGE_KEY = 'tikitak:sound-enabled';
const SWITCH_STORAGE_KEY = 'tikitak:key-switch';

const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장하지 못해도 이번 접속 동안은 동작한다
  }
};

const readKeySwitch = (): KeySwitch => {
  const saved = readStorage(SWITCH_STORAGE_KEY);
  return KEY_SWITCHES.find((item) => item === saved) ?? 'tok';
};

type SoundState = {
  enabled: boolean;
  keySwitch: KeySwitch;
  toggleEnabled: () => void;
  setKeySwitch: (keySwitch: KeySwitch) => void;
};

export const useSoundStore = create<SoundState>((set, get) => ({
  // 저장된 값이 없으면 켜 둔다 (기기의 무음 모드는 별도로 따른다)
  enabled: readStorage(ENABLED_STORAGE_KEY) !== '0',
  keySwitch: readKeySwitch(),
  toggleEnabled: () => {
    const enabled = !get().enabled;
    writeStorage(ENABLED_STORAGE_KEY, enabled ? '1' : '0');
    set({ enabled });
  },
  setKeySwitch: (keySwitch) => {
    writeStorage(SWITCH_STORAGE_KEY, keySwitch);
    set({ keySwitch });
  },
}));

import { describe, expect, it } from 'vitest';
import { compareAppVersion, getRequiredAppUpdate } from './appVersionPolicy';

describe('appVersionPolicy', () => {
  it('semantic version strings are compared by numeric parts', () => {
    expect(compareAppVersion('1.0.2', '1.0.2')).toBe(0);
    expect(compareAppVersion('1.0.10', '1.0.2')).toBe(1);
    expect(compareAppVersion('1.0.2', '1.0.3')).toBe(-1);
  });

  it('requires update when current version is below the minimum version', () => {
    expect(
      getRequiredAppUpdate('1.0.1', {
        latestVersion: '1.0.2',
        minimumVersion: '1.0.2',
        updateMessage: '업데이트가 필요합니다.',
        storeUrl: 'https://apps.apple.com/kr/app/tikitak/id6787856530',
      }),
    ).toEqual({
      message: '업데이트가 필요합니다.',
      storeUrl: 'https://apps.apple.com/kr/app/tikitak/id6787856530',
    });
  });

  it('does not require update for the current submission version', () => {
    expect(
      getRequiredAppUpdate('1.0.2', {
        latestVersion: '1.0.2',
        minimumVersion: '1.0.2',
        forceUpdate: false,
      }),
    ).toBeNull();
  });

  it('can force update users below the latest version', () => {
    expect(
      getRequiredAppUpdate('1.0.2', {
        latestVersion: '1.0.3',
        minimumVersion: '1.0.2',
        forceUpdate: true,
      }),
    ).toEqual({
      message: '최신 버전으로 업데이트한 뒤 다시 이용해 주세요.',
      storeUrl: undefined,
    });
  });
});

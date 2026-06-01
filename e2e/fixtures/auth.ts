import { test as base } from '@playwright/test';
import { blockThirdParty, skipSplash } from './api';

// 스플래시 자동 skip하는 로그인 흐름용 test (스플래시/인증 검증 스펙은 base test 사용)
export const test = base.extend({
  page: async ({ page }, run) => {
    await skipSplash(page);
    await blockThirdParty(page);
    await run(page);
  },
});

export { expect } from '@playwright/test';

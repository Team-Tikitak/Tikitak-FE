import { test as base } from '@playwright/test';
import { skipSplash } from './api';

// 스플래시를 자동으로 건너뛰는 로그인 흐름용 test (스플래시/인증 자체를 검증하는 스펙은 base test 사용)
export const test = base.extend({
  page: async ({ page }, run) => {
    await skipSplash(page);
    await run(page);
  },
});

export { expect } from '@playwright/test';

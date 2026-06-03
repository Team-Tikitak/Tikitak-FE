const OBJECT_URL_REVOKE_AFTER_TRANSITION_MS = 5000;

export const revokeObjectUrlAfterTransition = (url: string) => {
  window.setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_AFTER_TRANSITION_MS);
};

export const revokeObjectUrlsAfterTransition = (urls: string[]) => {
  window.setTimeout(() => {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }, OBJECT_URL_REVOKE_AFTER_TRANSITION_MS);
};

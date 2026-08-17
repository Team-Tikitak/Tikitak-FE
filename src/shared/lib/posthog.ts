type PostHog = {
  opt_in_capturing: () => void;
  opt_out_capturing: () => void;
};

declare global {
  interface Window {
    posthog?: PostHog;
  }
}

export const setPostHogConsent = (hasConsent: boolean) => {
  const posthog = window.posthog;
  if (!posthog) return;

  if (hasConsent) {
    posthog.opt_in_capturing();
    return;
  }

  posthog.opt_out_capturing();
};

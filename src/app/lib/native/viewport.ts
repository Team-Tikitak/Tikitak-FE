export const applyNativeViewportMeta = (): void => {
  document
    .querySelector('meta[name="viewport"]')
    ?.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, interactive-widget=resizes-content, viewport-fit=cover',
    );
};

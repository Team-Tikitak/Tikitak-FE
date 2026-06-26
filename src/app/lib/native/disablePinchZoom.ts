export const disablePinchZoom = (): void => {
  const preventGesture = (event: Event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-allow-zoom]')) return;
    event.preventDefault();
  };
  document.addEventListener('gesturestart', preventGesture);
  document.addEventListener('gesturechange', preventGesture);
  document.addEventListener('gestureend', preventGesture);

  document.documentElement.style.touchAction = 'manipulation';
};

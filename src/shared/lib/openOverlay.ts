import { type OverlayControllerComponent, overlay } from 'overlay-kit';

export const openOverlay = (renderer: OverlayControllerComponent) => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  overlay.open(renderer);
};

interface PointerLike {
  clientX: number;
  clientY: number;
}

export const getPointerRatio = (event: PointerLike, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
};

export interface CaptureRect {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

export const computeCaptureRect = (
  videoWidth: number,
  videoHeight: number,
  displayWidth: number,
  displayHeight: number,
): CaptureRect | null => {
  if (videoWidth === 0 || videoHeight === 0 || displayWidth === 0 || displayHeight === 0) {
    return null;
  }

  const videoAspect = videoWidth / videoHeight;
  const displayAspect = displayWidth / displayHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = videoWidth;
  let sourceHeight = videoHeight;

  if (videoAspect > displayAspect) {
    sourceWidth = videoHeight * displayAspect;
    sourceX = (videoWidth - sourceWidth) / 2;
  } else if (videoAspect < displayAspect) {
    sourceHeight = videoWidth / displayAspect;
    sourceY = (videoHeight - sourceHeight) / 2;
  }

  return { sourceX, sourceY, sourceWidth, sourceHeight };
};

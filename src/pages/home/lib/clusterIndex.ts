import Supercluster from 'supercluster';
import type { Pin } from '@/shared/api/map/types';

const SUPERCLUSTER_MAX_ZOOM = 20;
const KAKAO_MIN_LEVEL = 1;
const KAKAO_MAX_LEVEL = 14;
const CLUSTER_RADIUS_PX = 80;

export const kakaoLevelToZoom = (level: number): number =>
  Math.max(0, Math.min(SUPERCLUSTER_MAX_ZOOM, Math.round(SUPERCLUSTER_MAX_ZOOM - level)));

export const zoomToKakaoLevel = (zoom: number): number =>
  Math.max(KAKAO_MIN_LEVEL, Math.min(KAKAO_MAX_LEVEL, Math.round(SUPERCLUSTER_MAX_ZOOM - zoom)));

interface PinFeatureProps {
  placeId: string;
  pin: Pin;
}

interface ClusterAggProps {
  representativeThumbnailUrl: string;
  representativeFeedCount: number;
}

export type PinClusterIndex = Supercluster<PinFeatureProps, ClusterAggProps>;

export const createPinClusterIndex = (pins: Pin[]): PinClusterIndex => {
  const index = new Supercluster<PinFeatureProps, ClusterAggProps>({
    radius: CLUSTER_RADIUS_PX,
    maxZoom: SUPERCLUSTER_MAX_ZOOM - KAKAO_MIN_LEVEL,
    map: (props) => ({
      representativeThumbnailUrl: props.pin.thumbnailUrl,
      representativeFeedCount: props.pin.feedCount,
    }),
    reduce: (accumulated, props) => {
      if (props.representativeFeedCount > accumulated.representativeFeedCount) {
        accumulated.representativeFeedCount = props.representativeFeedCount;
        accumulated.representativeThumbnailUrl = props.representativeThumbnailUrl;
      }
    },
  });

  index.load(
    pins.map((pin) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [pin.longitude, pin.latitude] },
      properties: { placeId: pin.placeId, pin },
    })),
  );

  return index;
};

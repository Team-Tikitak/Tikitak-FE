export interface Pin {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  thumbnailUrl: string;
  feedCount: number;
}

export type GetPinsResponse = {
  pins: Pin[];
};

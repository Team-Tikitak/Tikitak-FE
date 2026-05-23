export interface PlaceSearchParams {
  query: string;
  longitude?: string;
  latitude?: string;
  radius?: number;
  page?: number;
  size?: number;
}

export interface PlaceSearchItem {
  kakaoPlaceId: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  distance: string;
}

export interface PlaceSearchResponse {
  meta: {
    totalCount: number;
    end: boolean;
  };
  places: PlaceSearchItem[];
}

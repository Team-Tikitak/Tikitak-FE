export type ApiResponse<T> = {
  success: boolean;
  status: string;
  data: T;
  timestamp: string;
};

export type ApiResponse<T> = {
  success: boolean;
  status: string;
  date: T;
  timestamp: Date;
};

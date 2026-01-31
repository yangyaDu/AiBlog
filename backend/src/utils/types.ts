
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

export enum ErrorCode {
  SUCCESS = 0,
  UNKNOWN_ERROR = 5000,
  NOT_FOUND = 4004,
  UNAUTHORIZED = 4001,
  FORBIDDEN = 4003,
  VALIDATION_ERROR = 4000,
  RATE_LIMIT_EXCEEDED = 4290,
  USER_EXISTS = 1001,
  INVALID_CREDENTIALS = 1002,
}

export class BizError extends Error {
  constructor(public code: ErrorCode, public message: string, public status: number = 400) {
    super(message);
  }
}

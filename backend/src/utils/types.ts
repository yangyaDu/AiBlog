
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

// 错误码对应的错误信息和 HTTP 状态码
export interface ErrorInfo {
  message: string;
  status: number;
}

export const ErrorMessages: Record<ErrorCode, ErrorInfo> = {
  [ErrorCode.SUCCESS]: {
    message: "Success",
    status: 200,
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    message: "Internal Server Error",
    status: 500,
  },
  [ErrorCode.NOT_FOUND]: {
    message: "Resource not found",
    status: 404,
  },
  [ErrorCode.UNAUTHORIZED]: {
    message: "Unauthorized",
    status: 401,
  },
  [ErrorCode.FORBIDDEN]: {
    message: "Forbidden",
    status: 403,
  },
  [ErrorCode.VALIDATION_ERROR]: {
    message: "Validation Failed",
    status: 400,
  },
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    message: "Rate limit exceeded",
    status: 429,
  },
  [ErrorCode.USER_EXISTS]: {
    message: "User already exists",
    status: 409,
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    message: "Invalid username or password",
    status: 401,
  },
};

// 获取错误信息的辅助函数
export function getErrorInfo(code: ErrorCode, customMessage?: string): ErrorInfo {
  const info = ErrorMessages[code];
  return {
    message: customMessage || info.message,
    status: info.status,
  };
}

// 保留 BizError 用于向后兼容（如果其他地方还在使用）
export class BizError extends Error {
  constructor(public code: ErrorCode, public message: string, public status: number = 400) {
    super(message);
  }
}

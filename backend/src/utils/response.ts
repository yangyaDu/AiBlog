import { t, TSchema } from "elysia";
import { ApiResponse, ErrorCode } from "./types";

export const Result = {
  success: <T>(data: T, message: string = "success"): ApiResponse<T> => ({
    code: ErrorCode.SUCCESS,
    message,
    data,
  }),
  
  error: (code: ErrorCode, message: string, data: any = null): ApiResponse => ({
    code,
    message,
    data,
  }),
};

// Generic Response Schema Factory for TypeBox
export const createResponseSchema = <T extends TSchema>(schema: T) => t.Object({
    code: t.Number(),
    message: t.String(),
    data: t.Union([schema, t.Null()]) 
});
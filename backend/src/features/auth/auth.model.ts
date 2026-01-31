
import { t, Static } from "elysia";

export const RegisterSchema = t.Object({
  username: t.String(),
  password: t.String(),
  captchaCode: t.String(), // User input
  expectedCaptcha: t.String(), // Encrypted/hashed expected answer from frontend (Simulating Session)
});

export const LoginSchema = t.Object({
  username: t.String(),
  password: t.String(),
  captchaCode: t.String(),
  expectedCaptcha: t.String(),
});

export const AuthResponseSchema = t.Object({
  token: t.Optional(t.String()),
  user: t.Optional(t.Object({
    id: t.String(),
    username: t.String()
  })),
  userId: t.Optional(t.String())
});

export type RegisterDTO = Static<typeof RegisterSchema>;
export type LoginDTO = Static<typeof LoginSchema>;

export interface AuthResponse {
  token?: string;
  user?: {
    id: string;
    username: string;
  };
  userId?: string;
}

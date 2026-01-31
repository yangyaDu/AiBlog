
import { t, Static } from "elysia";

export const RegisterSchema = t.Object({
  username: t.String({ minLength: 3 }), // Changed from email format to simple string
  password: t.String({ minLength: 6 }),
});

export const LoginSchema = t.Object({
  username: t.String(),
  password: t.String(),
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

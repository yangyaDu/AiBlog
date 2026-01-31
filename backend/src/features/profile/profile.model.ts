import { t, Static } from "elysia";

export const UpdateProfileSchema = t.Object({
  role: t.String(),
  titlePrefix: t.String(),
  titleHighlight: t.String(),
  titleSuffix: t.String(),
  intro: t.String(),
});

export const ProfileResponseSchema = t.Object({
  id: t.Optional(t.Number()),
  role: t.String(),
  titlePrefix: t.String(),
  titleHighlight: t.String(),
  titleSuffix: t.String(),
  intro: t.String(),
});

export type UpdateProfileDTO = Static<typeof UpdateProfileSchema>;

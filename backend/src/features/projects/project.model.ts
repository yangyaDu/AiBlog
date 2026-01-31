
import { t, Static } from "elysia";

export const CreateProjectSchema = t.Object({
  title: t.String(),
  description: t.String(),
  tags: t.String(), // Comma separated string from frontend form
  imageStr: t.Optional(t.String()),
  file: t.Optional(t.File()),
});

export const ProjectItemSchema = t.Object({
  id: t.String(),
  authorId: t.String(),
  title: t.String(),
  description: t.String(),
  tags: t.Array(t.String()),
  image: t.String(),
  link: t.Union([t.String(), t.Null()]),
  date: t.Number(),
});

export const ProjectListResponseSchema = t.Object({
  data: t.Array(ProjectItemSchema),
  total: t.Number(),
  page: t.Number(),
  totalPages: t.Number()
});

export const DeleteProjectQuerySchema = t.Object({
  id: t.String()
});

export type CreateProjectDTO = Static<typeof CreateProjectSchema>;

export interface ProjectResponse {
    data: any[];
    total: number;
    page: number;
    totalPages: number;
}

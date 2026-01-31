
import { db } from "../../db";
import { projects } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { saveFile } from "../../utils/file";
import { ErrorCode } from "../../utils/types";
import { CreateProjectDTO, ProjectResponse } from "./project.model";

export const ProjectService = {
  async getAll(page: number, limit: number, tag?: string): Promise<[ErrorCode, ProjectResponse]> {
    const offset = (page - 1) * limit;
    
    // SQLite limitation: fetch all then filter
    const all = await db.select().from(projects).orderBy(desc(projects.date));
    
    let filtered = all.map(p => ({...p, tags: JSON.parse(p.tags) as string[]}));
    if (tag) {
      filtered = filtered.filter(p => p.tags.includes(tag));
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return [ErrorCode.SUCCESS, {
      data: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }];
  },

  async create(userId: string, body: CreateProjectDTO): Promise<[ErrorCode, any]> {
    let imageUrl = body.imageStr;
    if (body.file instanceof File) {
      imageUrl = await saveFile(body.file);
    }

    const tagsList = body.tags.split(",").map((s) => s.trim());

    const newProject = {
      id: randomUUID(),
      authorId: userId,
      title: body.title,
      description: body.description,
      tags: JSON.stringify(tagsList),
      image: imageUrl || "https://picsum.photos/600/400",
      date: Date.now(),
      link: "",
      createdBy: userId
    };

    await db.insert(projects).values(newProject);
    return [ErrorCode.SUCCESS, {
      ...newProject,
      tags: tagsList
    }];
  },

  async delete(userId: string, projectId: string): Promise<[ErrorCode, boolean | null]> {
    const existing = await db.select().from(projects).where(eq(projects.id, projectId)).get();
    
    if (!existing) {
       return [ErrorCode.NOT_FOUND, null];
    }
    if (existing.authorId !== userId) {
       return [ErrorCode.FORBIDDEN, null];
    }

    await db.delete(projects).where(eq(projects.id, projectId));
    return [ErrorCode.SUCCESS, true];
  }
};

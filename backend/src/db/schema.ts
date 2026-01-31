
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users Table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Profile Table (Singleton mostly)
export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey(), // Always 1
  role: text("role").notNull(),
  titlePrefix: text("title_prefix").notNull(),
  titleHighlight: text("title_highlight").notNull(),
  titleSuffix: text("title_suffix").notNull(),
  intro: text("intro").notNull(),
});

// Projects Table
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").notNull(), // JSON stringified array
  image: text("image").notNull(), // URL path
  link: text("link"),
  date: integer("date").notNull(), // Timestamp
}, (table) => ({
  // Indexes for query optimization
  authorIdx: index("projects_author_idx").on(table.authorId),
  dateIdx: index("projects_date_idx").on(table.date),
}));

// Blog Posts Table
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  
  // Content
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(), // Markdown (Rich Text)
  tags: text("tags"), // JSON stringified array
  coverImage: text("cover_image"),
  readTime: text("read_time").notNull(),

  // Audit Fields
  createdBy: text("created_by").notNull(), // User ID
  updatedBy: text("updated_by"),           // User ID
  
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
}, (table) => ({
  // Indexes for query optimization
  creatorIdx: index("posts_creator_idx").on(table.createdBy),
  createdIdx: index("posts_created_idx").on(table.createdAt),
}));

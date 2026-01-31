
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
  
  // Audit
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
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
  
  // Audit Fields
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
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

// Post Likes Table
export const postLikes = sqliteTable("post_likes", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  userId: text("user_id").notNull(),
  
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  deletedAt: integer("deleted_at", { mode: "timestamp" }), // Logical deletion
}, (table) => ({
  postIdx: index("likes_post_idx").on(table.postId),
  userIdx: index("likes_user_idx").on(table.userId),
}));

// Post Comments Table
export const postComments = sqliteTable("post_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  parentId: text("parent_id"), // For threaded comments
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }), // Logical deletion
}, (table) => ({
  postIdx: index("comments_post_idx").on(table.postId),
  parentIdx: index("comments_parent_idx").on(table.parentId),
}));

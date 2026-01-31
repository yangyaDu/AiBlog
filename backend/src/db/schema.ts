
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users Table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Profile Table
export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey(),
  role: text("role").notNull(),
  titlePrefix: text("title_prefix").notNull(),
  titleHighlight: text("title_highlight").notNull(),
  titleSuffix: text("title_suffix").notNull(),
  intro: text("intro").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
});

// Projects Table
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").notNull(),
  image: text("image").notNull(),
  link: text("link"),
  date: integer("date").notNull(),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
}, (table) => ({
  authorIdx: index("projects_author_idx").on(table.authorId),
  dateIdx: index("projects_date_idx").on(table.date),
}));

// Blog Posts Table
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  tags: text("tags"),
  coverImage: text("cover_image"),
  readTime: text("read_time").notNull(),
  status: text("status").default('draft').notNull(),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
}, (table) => ({
  creatorIdx: index("posts_creator_idx").on(table.createdBy),
  createdIdx: index("posts_created_idx").on(table.createdAt),
}));

// --- Feature: Likes ---
export const postLikes = sqliteTable("post_likes", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
}, (table) => ({
  postIdx: index("likes_post_idx").on(table.postId),
  userIdx: index("likes_user_idx").on(table.userId),
}));

// --- Feature: Comments ---
export const postComments = sqliteTable("post_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  parentId: text("parent_id"),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
}, (table) => ({
  postIdx: index("comments_post_idx").on(table.postId),
  parentIdx: index("comments_parent_idx").on(table.parentId),
  userIdx: index("comments_user_idx").on(table.userId),
}));

// --- Feature: Follows ---
export const follows = sqliteTable("follows", {
  followerId: text("follower_id").notNull(),
  followingId: text("following_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  pk: primaryKey(table.followerId, table.followingId),
  followerIdx: index("follows_follower_idx").on(table.followerId),
  followingIdx: index("follows_following_idx").on(table.followingId),
}));

// --- Feature: History (Post Views) ---
export const postViews = sqliteTable("post_views", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: text("post_id").notNull(),
  viewedAt: integer("viewed_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdx: index("views_user_idx").on(table.userId),
  postIdx: index("views_post_idx").on(table.postId),
}));

// --- Feature: Notifications ---
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Recipient
  type: text("type").notNull(), // 'post_new' | 'comment_reply' | 'post_like' | 'post_comment' | 'follow'
  referenceId: text("reference_id"), // ID of related entity
  senderId: text("sender_id"), // Triggered by
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdx: index("notif_user_idx").on(table.userId),
}));

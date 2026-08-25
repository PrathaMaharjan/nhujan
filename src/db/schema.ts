import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const preloaderImages = pgTable("preloader_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  publicId: text("public_id").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const workCategories = pgTable("work_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtext: text("subtext").notNull().default(""),
  imageUrl: text("image_url"),
  publicId: text("public_id"),
  order: integer("order").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workProjects = pgTable("work_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  categorySlug: text("category_slug").notNull(), // "commercial", "film", "music-videos", "event-coverage", etc.
  title: text("title").notNull(),
  categoryLabel: text("category_label").notNull().default(""), // e.g. "NARRATIVE", "MUSIC VIDEO"
  thumbnailUrl: text("thumbnail_url"), // static image for right sidebar thumbnail
  thumbnailPublicId: text("thumbnail_public_id"),
  gifUrl: text("gif_url"), // animated GIF for center main stage
  gifPublicId: text("gif_public_id"),
  heroImageUrl: text("hero_image_url"),
  heroImagePublicId: text("hero_image_public_id"),
  vimeoId: text("vimeo_id").notNull().default(""),
  director: text("director").notNull().default(""),
  year: text("year").notNull().default(""),
  client: text("client").notNull().default(""),
  description: text("description").notNull().default(""),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectGalleryImages = pgTable("project_gallery_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  imageUrl: text("image_url").notNull(),
  publicId: text("public_id"),
  colSpan: text("col_span").notNull().default("col-span-12 md:col-span-6"), // layout: e.g. "col-span-12", "col-span-12 md:col-span-6", "col-span-12 md:col-span-4", "col-span-12 md:col-span-8"
  aspectRatio: text("aspect_ratio").notNull().default("aspect-[16/9]"), // aspect: e.g. "aspect-[16/9]", "aspect-[21/8]", "aspect-[4/3]", "aspect-[1/1]", "aspect-[9/16]"
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
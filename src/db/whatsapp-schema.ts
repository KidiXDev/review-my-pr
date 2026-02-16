import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { user } from "./auth-schema";

export const whatsappSessions = pgTable("whatsapp_session", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isConnected: boolean("is_connected").default(false).notNull(),
  phoneNumber: text("phone_number"),
  lastConnectedAt: timestamp("last_connected_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const whatsappGroups = pgTable("whatsapp_group", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  groupId: text("group_id").notNull(), // Actual WA group ID
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const githubRepositories = pgTable("github_repository", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  repoName: text("repo_name").notNull(), // owner/name
  apiToken: text("api_token").notNull(),
  allowedEvents: text("allowed_events").array(), // Array of event types
  groupIds: text("group_ids").array(), // Array of WhatsApp group IDs
  messageTemplate: text("message_template"), // Custom message template
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notificationTemplates = pgTable("notification_template", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // pr_opened, ci_failed, etc.
  templateText: text("template_text").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations

export const whatsappSessionsRelations = relations(
  whatsappSessions,
  ({ one }) => ({
    user: one(user, {
      fields: [whatsappSessions.userId],
      references: [user.id],
    }),
  }),
);

export const whatsappGroupsRelations = relations(whatsappGroups, ({ one }) => ({
  user: one(user, {
    fields: [whatsappGroups.userId],
    references: [user.id],
  }),
}));

export const githubRepositoriesRelations = relations(
  githubRepositories,
  ({ one }) => ({
    user: one(user, {
      fields: [githubRepositories.userId],
      references: [user.id],
    }),
  }),
);

export const notificationTemplatesRelations = relations(
  notificationTemplates,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationTemplates.userId],
      references: [user.id],
    }),
  }),
);

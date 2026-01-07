import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const maps = pgTable('maps', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    content: jsonb('content'), // Stores the snapshot of the mind map
    ownerId: uuid('owner_id').references(() => users.id).notNull(),
    teamId: uuid('team_id').references(() => teams.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

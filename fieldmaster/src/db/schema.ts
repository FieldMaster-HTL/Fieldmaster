import { integer, pgTable, varchar, boolean as PgBoolean} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
});

// Tools Table
export const toolsTable = pgTable("tools", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    category: varchar({ length: 255 }).notNull(), 
    available: PgBoolean().notNull(), 
});
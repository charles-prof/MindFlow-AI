import { db } from '../db/client';
import { users } from '../db/schema';
// import { eq } from 'drizzle-orm';

export const getOrCreateUser = async () => {
    const existing = await db.select().from(users).limit(1);
    if (existing.length > 0) {
        return existing[0];
    }

    const result = await db.insert(users).values({
        name: 'Demo User',
        email: 'demo@example.com',
    }).returning();

    return result[0];
};

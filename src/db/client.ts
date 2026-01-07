import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

// Initialize PGlite (in-memory by default, or provide a path for persistence)
// For a purely browser-local app with persistence, we can use IndexedDB via 'idb://' prefix
// but for now let's keep it simple or use a specific folder if running in a certain env.
// In the browser, "idb://my-db" works for persistence.
const client = new PGlite("idb://mindflow-db");

export const db = drizzle(client, { schema });
export { client };

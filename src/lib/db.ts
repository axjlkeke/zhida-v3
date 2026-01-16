import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({ connectionString: "postgresql://localhost:5432/placeholder" });

export const db = drizzle(pool);

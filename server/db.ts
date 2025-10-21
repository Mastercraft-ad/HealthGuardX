// db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "psql 'postgresql://neondb_owner:npg_1DQGHRX3wBVM@ep-small-voice-ad6ltt23-pooler.c-2.us-east-1.aws.neon.tech/HealthGuardX?sslmode=require&channel_binding=require'",
  ssl: {
    rejectUnauthorized: false, // Required for Neon SSL connection
  },
});

export default pool;

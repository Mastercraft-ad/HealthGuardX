import * as schema from "@shared/schema";

// Prefer Postgres/Neon when DATABASE_URL is set. Otherwise use a local
// SQLite database for quick local development.
let db: any;

if (process.env.DATABASE_URL) {
  // Lazy-load neon-specific modules only when needed to avoid requiring
  // these packages when using the SQLite fallback.
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = (await import('ws')).default;

  // Configure WebSocket with SSL certificate handling for Replit environment
  class CustomWebSocket extends ws {
    constructor(address: string, protocols?: string | string[]) {
      super(address, protocols, {
        rejectUnauthorized: false // Accept self-signed certificates in development
      });
    }
  }

  neonConfig.webSocketConstructor = CustomWebSocket as any;

  // Disable pipelining to use regular HTTP pooling instead of WebSocket
  neonConfig.pipelineConnect = false;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });

} else {
  // SQLite fallback for local development. Uses better-sqlite3 for simplicity.
  // This keeps the development experience fast and zero-config.
  const Database = (await import('better-sqlite3')).default;
  const { drizzle } = await import('drizzle-orm/better-sqlite3');

  const sqliteFile = process.env.SQLITE_FILE || './dev.sqlite';
  const sqlite = new Database(sqliteFile);
  db = drizzle(sqlite, { schema });
}

export { db };

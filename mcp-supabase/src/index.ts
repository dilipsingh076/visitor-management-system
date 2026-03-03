#!/usr/bin/env node

/**
 * MCP server for VMS Supabase database (vmsdevelop).
 * Connects via DATABASE_URL (Postgres connection string from Supabase).
 * Exposes: list_tables, run_sql (read-only), get_table_columns.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import pg from "pg";
import { z } from "zod";

const { Pool } = pg;

function getPool(): pg.Pool {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    throw new Error(
      "Missing DATABASE_URL or SUPABASE_DB_URL. Add it in Cursor MCP config (env) for this server. Do NOT paste it in chat."
    );
  }
  const isSupabase = /supabase\.co|pooler\.supabase\.com/.test(url);
  return new Pool({
    connectionString: url,
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 8000,
    ...(isSupabase && { ssl: { rejectUnauthorized: false } }),
  });
}

async function withPool<T>(fn: (pool: pg.Pool) => Promise<T>): Promise<T> {
  const pool = getPool();
  try {
    return await fn(pool);
  } finally {
    await pool.end();
  }
}

const server = new McpServer({
  name: "vms-supabase",
  version: "1.0.0",
});

server.registerTool(
  "list_tables",
  {
    title: "List database tables",
    description: "List tables in the public schema of the VMS Supabase database. Use to see what tables exist.",
    inputSchema: {},
    outputSchema: {
      ok: z.boolean(),
      tables: z.array(z.string()).optional(),
      error: z.string().optional(),
    },
  },
  async () => {
    try {
      const rows = await withPool(async (pool) => {
        const res = await pool.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        return res.rows as { table_name: string }[];
      });
      const tables = rows.map((r) => r.table_name);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ok: true, tables }, null, 2) }],
        structuredContent: { ok: true, tables },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }, null, 2) }],
        structuredContent: { ok: false, error: message },
      };
    }
  }
);

server.registerTool(
  "get_table_columns",
  {
    title: "Get table columns (schema)",
    description: "Return column names and types for a table in the public schema.",
    inputSchema: {
      table: z.string().describe("Table name (e.g. societies, users, buildings)"),
    },
    outputSchema: {
      ok: z.boolean(),
      table: z.string().optional(),
      columns: z.array(z.object({ name: z.string(), type: z.string(), is_nullable: z.string() })).optional(),
      error: z.string().optional(),
    },
  },
  async (args) => {
    const table = String(args.table).trim();
    if (!/^[a-z_][a-z0-9_]*$/i.test(table)) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: "Invalid table name" }, null, 2) }],
        structuredContent: { ok: false, error: "Invalid table name" },
      };
    }
    try {
      const columns = await withPool(async (pool) => {
        const res = await pool.query(
          `SELECT column_name AS name, data_type AS type, is_nullable
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1
           ORDER BY ordinal_position`,
          [table]
        );
        return res.rows as { name: string; type: string; is_nullable: string }[];
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ok: true, table, columns }, null, 2) }],
        structuredContent: { ok: true, table, columns },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }, null, 2) }],
        structuredContent: { ok: false, error: message },
      };
    }
  }
);

server.registerTool(
  "run_sql",
  {
    title: "Run read-only SQL",
    description:
      "Run a SELECT query against the VMS Supabase database. Only SELECT is allowed. Use to check data, row counts, or schema.",
    inputSchema: {
      query: z.string().describe("SQL SELECT query (e.g. SELECT * FROM societies LIMIT 5)"),
    },
    outputSchema: {
      ok: z.boolean(),
      rows: z.array(z.record(z.unknown())).optional(),
      rowCount: z.number().optional(),
      error: z.string().optional(),
    },
  },
  async (args) => {
    const query = String(args.query).trim();
    const upper = query.toUpperCase();
    if (!upper.startsWith("SELECT")) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ ok: false, error: "Only SELECT queries are allowed for safety." }, null, 2),
          },
        ],
        structuredContent: { ok: false, error: "Only SELECT queries are allowed for safety." },
      };
    }
    try {
      const result = await withPool(async (pool) => {
        const res = await pool.query(query);
        const rows = (res.rows ?? []) as Record<string, unknown>[];
        return { rows, rowCount: rows.length };
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ ok: true, rowCount: result.rowCount, rows: result.rows }, null, 2),
          },
        ],
        structuredContent: { ok: true, rows: result.rows, rowCount: result.rowCount },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ok: false, error: message }, null, 2) }],
        structuredContent: { ok: false, error: message },
      };
    }
  }
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("VMS Supabase MCP server running. Tools: list_tables, get_table_columns, run_sql");
}

runServer().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

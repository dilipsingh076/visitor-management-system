#!/usr/bin/env node

/**
 * MCP server for Visitor Management System UI visualization.
 * Exposes tools to fetch the login/signup/register society page HTML from the running dev server
 * so the AI can analyze structure and suggest UI improvements.
 *
 * Prerequisites: Run the frontend dev server (e.g. npm run dev in frontend-web) so localhost serves the app.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const DEFAULT_PORT = 3000;
const DEFAULT_BASE = "http://127.0.0.1";

async function fetchPage(path: string, port: number): Promise<string> {
  const url = `${DEFAULT_BASE}:${port}${path}`;
  const res = await fetch(url, {
    headers: { "Accept": "text/html" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function stripScriptsAndStyles(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "\n[script removed]\n")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "\n[style removed]\n")
    .replace(/\s+/g, " ")
    .trim();
}

function extractBodySummary(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;
  const stripped = stripScriptsAndStyles(body);
  return stripped.slice(0, 12000) + (stripped.length > 12000 ? "\n... [truncated]" : "");
}

const server = new McpServer({
  name: "vms-visualize",
  version: "1.0.0",
});

server.registerTool(
  "fetch_login_page",
  {
    title: "Fetch login page HTML",
    description: `Fetches the VMS login/signup/register society page HTML from the running Next.js dev server (e.g. http://127.0.0.1:3000/login). Use this to visualize and analyze the current UI structure, class names, and layout so you can suggest concrete improvements. Ensure the frontend dev server is running (npm run dev in frontend-web) before calling.`,
    inputSchema: {
      port: z.number().int().min(1).max(65535).optional().default(DEFAULT_PORT),
      stripMarkup: z.boolean().optional().default(true).describe("If true, remove script/style tags and normalize whitespace for easier reading"),
    },
    outputSchema: {
      ok: z.boolean(),
      url: z.string(),
      htmlLength: z.number(),
      summary: z.string().optional(),
      error: z.string().optional(),
    },
  },
  async (args) => {
    const port = args.port ?? DEFAULT_PORT;
    const path = "/login";
    const url = `${DEFAULT_BASE}:${port}${path}`;
    try {
      const html = await fetchPage(path, port);
      const summary = args.stripMarkup !== false ? extractBodySummary(html) : html.slice(0, 15000);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                ok: true,
                url,
                htmlLength: html.length,
                summary,
                hint: "Review the 'summary' (or raw HTML) to see current structure and class names. Suggest specific Tailwind/layout/copy improvements for sign-in, sign-up, and register society.",
              },
              null,
              2
            ),
          },
        ],
        structuredContent: {
          ok: true,
          url,
          htmlLength: html.length,
          summary: args.stripMarkup !== false ? extractBodySummary(html) : undefined,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                ok: false,
                url,
                error: message,
                hint: "Start the frontend dev server (e.g. cd frontend-web && npm run dev) and try again.",
              },
              null,
              2
            ),
          },
        ],
        structuredContent: {
          ok: false,
          url,
          error: message,
        },
      };
    }
  }
);

server.registerTool(
  "get_app_urls",
  {
    title: "Get VMS app URLs",
    description: "Returns the local dev URLs for the Visitor Management System (login, home, etc.) so you can reference them when suggesting the user open the app to visualize the UI.",
    inputSchema: {
      port: z.number().int().min(1).max(65535).optional().default(DEFAULT_PORT),
    },
    outputSchema: {
      login: z.string(),
      home: z.string(),
      base: z.string(),
    },
  },
  async (args) => {
    const port = args.port ?? DEFAULT_PORT;
    const base = `${DEFAULT_BASE}:${port}`;
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              login: `${base}/login`,
              home: `${base}/`,
              base,
            },
            null,
            2
          ),
        },
      ],
      structuredContent: {
        login: `${base}/login`,
        home: `${base}/`,
        base,
      },
    };
  }
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("VMS Visualize MCP server running on stdio. Tools: fetch_login_page, get_app_urls");
}

runServer().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

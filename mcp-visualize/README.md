# VMS Visualize MCP Server

MCP server that lets the AI **visualize** the Visitor Management System UI by fetching the login/signup/register society page HTML from your running dev server. Use it to see why the UI "still looks bad" and get concrete improvement suggestions.

## Tools

| Tool | Description |
|------|-------------|
| **fetch_login_page** | Fetches `/login` from your Next.js dev server and returns the page HTML (scripts/styles stripped by default) so the AI can analyze structure, class names, and layout. |
| **get_app_urls** | Returns local dev URLs (login, home) for reference. |

## Prerequisites

1. **Frontend dev server running**  
   From the project root:
   ```bash
   cd frontend-web && npm run dev
   ```
   Leave it running so the app is available at `http://127.0.0.1:3000` (or your configured port).

2. **Build the MCP server** (once):
   ```bash
   cd mcp-visualize && npm install && npm run build
   ```

## Cursor setup

1. Add the server to Cursor's MCP config.

   **Project-level** (recommended): create or edit `.cursor/mcp.json` in the **workspace root** (parent of `mcp-visualize` and `frontend-web`):

   ```json
   {
     "mcpServers": {
       "vms-visualize": {
         "command": "node",
         "args": ["./mcp-visualize/dist/index.js"]
       }
     }
   }
   ```

   If the server does not start (e.g. workspace path has spaces or Cursor’s cwd is different), use an **absolute path** in `args`:

   ```json
   "args": ["C:/Users/YOUR_USERNAME/Desktop/Visitor management systme/mcp-visualize/dist/index.js"]
   ```

   Use your actual path; forward slashes work on Windows.

   **Global**: edit `~/.cursor/mcp.json` (or Windows: `%USERPROFILE%\.cursor\mcp.json`) and set `cwd` to your project root and `args` to the path to `mcp-visualize/dist/index.js` from that root.

2. **Restart Cursor** so it picks up the new MCP server.

3. In chat, ask the AI to use the **fetch_login_page** tool (e.g. "Use the MCP tool to fetch the login page and tell me why the UI looks bad and how to fix it"). The AI will call the tool, get the HTML, and can suggest specific Tailwind/layout/copy changes.

## Run manually (stdio)

```bash
cd mcp-visualize
npm run build
npm start
```

The server talks MCP over stdio; Cursor (or another MCP client) will spawn it when needed.

## Port

By default the tool fetches from port **3000**. You can pass a different port when calling the tool (e.g. if your dev server runs on 3001).

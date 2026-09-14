import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// Initialize the MCP Server
const server = new Server(
  {
    name: "taiga-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Read configurations from environment variables
const TAIGA_URL = process.env.TAIGA_URL || "https://api.taiga.io";
const TAIGA_AUTH_TOKEN = process.env.TAIGA_AUTH_TOKEN;

if (!TAIGA_AUTH_TOKEN) {
  console.error("Warning: TAIGA_AUTH_TOKEN environment variable is not set.");
}

// Helper for Taiga API headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${TAIGA_AUTH_TOKEN}`,
});

// 1. List Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_projects",
        description: "List all accessible Taiga projects for the authenticated user",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "list_issues",
        description: "List all issues within a specific Taiga project",
        inputSchema: {
          type: "object",
          properties: {
            projectId: {
              type: "number",
              description: "The numeric ID of the Taiga project",
            },
          },
          required: ["projectId"],
        },
      },
      {
        name: "create_issue",
        description: "Create a new issue/ticket in a Taiga project",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "number", description: "Project numeric ID" },
            subject: { type: "string", description: "Title/subject of the ticket" },
            description: { type: "string", description: "Detailed issue markdown description" },
          },
          required: ["projectId", "subject"],
        },
      },
    ],
  };
});

// 2. Handle Tool Call Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_projects": {
        const response = await fetch(`${TAIGA_URL}/api/v1/projects`, {
          headers: getHeaders(),
        });
        const data = await response.json();
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "list_issues": {
        const { projectId } = args as { projectId: number };
        const response = await fetch(`${TAIGA_URL}/api/v1/issues?project=${projectId}`, {
          headers: getHeaders(),
        });
        const data = await response.json();
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "create_issue": {
        const { projectId, subject, description } = args as {
          projectId: number;
          subject: string;
          description?: string;
        };
        const response = await fetch(`${TAIGA_URL}/api/v1/issues`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            project: projectId,
            subject,
            description: description || "",
          }),
        });
        const data = await response.json();
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message || "An unknown error occurred" }],
    };
  }
});

// Start the server using Stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Taiga MCP Server running on stdio transport.");

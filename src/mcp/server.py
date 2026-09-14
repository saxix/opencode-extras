"""
Taiga Ticket System MCP Server
Implements Model Context Protocol (MCP) using Python FastMCP to interact with the Taiga REST API.
"""
import os
import sys
from typing import Optional, List, Dict, Any
import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP Server
mcp = FastMCP("Taiga Tickets")

# Fetch configuration from environment variables
TAIGA_URL = os.environ.get("TAIGA_URL", "https://api.taiga.io").rstrip("/")
TAIGA_TOKEN = os.environ.get("TAIGA_AUTH_TOKEN")

def get_headers() -> Dict[str, str]:
    if not TAIGA_TOKEN:
        print("Error: TAIGA_AUTH_TOKEN environment variable is not set.", file=sys.stderr)
        sys.exit(1)
    return {
        "Authorization": f"Bearer {TAIGA_TOKEN}",
        "Content-Type": "application/json",
        "x-disable-pagination": "true"
    }

@mcp.tool()
async def list_projects() -> str:
    """
    List all accessible projects in the Taiga ticket tracking system.
    Returns a string summary of project IDs and names.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{TAIGA_URL}/api/v1/projects",
                headers=get_headers(),
                timeout=10.0
            )
            response.raise_for_status()
            projects = response.json()
            
            if not projects:
                return "No projects found."
            
            output = ["Available Taiga Projects:"]
            for p in projects:
                output.append(f"- ID: {p.get('id')} | Name: {p.get('name')} | Slug: {p.get('slug')}")
            return "\n".join(output)
            
        except httpx.HTTPStatusError as e:
            return f"Failed to fetch projects. Server returned code {e.response.status_code}: {e.response.text}"
        except Exception as e:
            return f"An error occurred while connecting to Taiga: {str(e)}"

@mcp.tool()
async def get_issues(project_id: int, status_id: Optional[int] = None) -> str:
    """
    Fetch issues for a specific Taiga project.
    
    Args:
        project_id: The numeric ID of the Taiga project.
        status_id: Optional ID to filter issues by a specific status.
    """
    params = {"project": project_id}
    if status_id:
        params["status"] = status_id

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{TAIGA_URL}/api/v1/issues",
                headers=get_headers(),
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            issues = response.json()
            
            if not issues:
                return f"No issues found for project ID {project_id}."
            
            output = [f"Issues for Project ID {project_id}:"]
            for issue in issues:
                output.append(
                    f"[{issue.get('ref')}] ID: {issue.get('id')} | "
                    f"Subject: {issue.get('subject')} | "
                    f"Status: {issue.get('status_extra_info', {}).get('name', 'Unknown')}"
                )
            return "\n".join(output)
            
        except httpx.HTTPStatusError as e:
            return f"Failed to fetch issues. Server returned code {e.response.status_code}: {e.response.text}"
        except Exception as e:
            return f"An error occurred while fetching issues: {str(e)}"

@mcp.tool()
async def create_issue(project_id: int, subject: str, description: str) -> str:
    """
    Create a new ticket/issue in a designated Taiga project.
    
    Args:
        project_id: The numeric ID of the target project.
        subject: Title or summary of the issue.
        description: Detailed context or body payload for the ticket.
    """
    payload = {
        "project": project_id,
        "subject": subject,
        "description": description
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{TAIGA_URL}/api/v1/issues",
                headers=get_headers(),
                json=payload,
                timeout=10.0
            )
            response.raise_for_status()
            issue = response.json()
            
            return (
                f"Successfully created Issue #{issue.get('ref')}!\n"
                f"ID: {issue.get('id')}\n"
                f"Subject: {issue.get('subject')}\n"
                f"Status: New"
            )
            
        except httpx.HTTPStatusError as e:
            return f"Failed to create issue. Server returned code {e.response.status_code}: {e.response.text}"
        except Exception as e:
            return f"An error occurred while creating the issue: {str(e)}"

if __name__ == "__main__":
    # Start the FastMCP stdio server
    mcp.run()

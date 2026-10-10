import { type Plugin, tool } from "@opencode-ai/plugin"
import type { Session } from "@opencode-ai/sdk"

export const SessionManagerPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      "list-sessions": tool({
        description: "List all active AI sessions with their status and age",
        args: {},
        async execute(_args, context) {
          const { client } = context
          const res = await client.session.list()
          const sessions: Session[] = res.data || []

          if (sessions.length === 0) {
            return "No active sessions found."
          }

          const now = Date.now()
          const lines = sessions.map((s) => {
            const created = s.time?.created ?? 0
            const ageMin = Math.round((now - created) / 60_000)
            const status = s.status ?? "unknown"
            return `- ${s.id} | ${status} | ${ageMin}m old | title: "${s.title ?? "(none)"}"`
          })

          return `Active sessions (${sessions.length}):\n${lines.join("\n")}`
        },
      }),

      "prune-sessions": tool({
        description: "Delete all sessions older than <x> days",
        args: {
          days: tool.schema.number().describe(
            "Maximum age in days. Sessions older than this will be deleted."
          ),
        },
        async execute(args, context) {
          const { client } = context
          const res = await client.session.list()
          const sessions: Session[] = res.data || []

          const now = Date.now()
          const maxMs = args.days * 24 * 60 * 60 * 1000

          const stale = sessions.filter(
            (s) => (now - (s.time?.created ?? 0)) > maxMs
          )

          if (stale.length === 0) {
            return `No sessions older than ${args.days} day(s).`
          }

          const deleted: string[] = []
          const failed: string[] = []

          for (const s of stale) {
            try {
              await client.session.delete({ path: { id: s.id } })
              deleted.push(s.id)
            } catch {
              failed.push(s.id)
            }
          }

          let msg = `Pruned ${deleted.length} session(s) older than ${args.days} day(s).\n`
          if (failed.length > 0) {
            msg += `Failed to delete (${failed.length}): ${failed.join(", ")}`
          }
          return msg
        },
      }),

      "archive-session": tool({
        description: "Archive a session by setting its status to archived",
        args: {
          sessionId: tool.schema.string().describe("ID of the session to archive"),
        },
        async execute(args, context) {
          const { client } = context

          try {
            await client.session.update({
              path: { id: args.sessionId },
              body: { status: "archived" },
            })
            return `Session ${args.sessionId} archived.`
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            return `Failed to archive session ${args.sessionId}: ${msg}`
          }
        },
      }),
    },
  }
}

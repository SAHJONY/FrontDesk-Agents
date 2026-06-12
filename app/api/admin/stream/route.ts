import { NextRequest } from "next/server";
import { isOwner } from "@/lib/auth";
import { listEventsSince } from "@/lib/store";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";
// Vercel Hobby caps function duration at ~10s; Pro at ~5min. We aim for the
// upper end; clients reconnect automatically when the stream closes.
export const maxDuration = 300;

// Server-Sent Events stream of platform activity. Polls the event log every
// second on the server side and pushes new events to the connected client.
export async function GET(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return new Response("Unauthorized", { status: 401 });

  const since = req.nextUrl.searchParams.get("since") ?? new Date(Date.now() - 60_000).toISOString();
  let lastSeen = since;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(event: string, payload: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`));
      }

      send("ready", { time: new Date().toISOString() });

      let stopped = false;
      const closeAt = Date.now() + 290_000;

      while (!stopped && Date.now() < closeAt) {
        try {
          const events = await listEventsSince(lastSeen, 50);
          if (events.length > 0) {
            // Stream chronologically (oldest first) for a natural ticker.
            const ordered = [...events].reverse();
            for (const ev of ordered) {
              send("event", ev);
              if (ev.createdAt > lastSeen) lastSeen = ev.createdAt;
            }
          } else {
            // Keep the connection warm for proxies that close idle streams.
            controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
          }
        } catch {
          // Recoverable — keep polling.
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      send("bye", { reason: "max_duration" });
      controller.close();
      stopped = true;
    },

    cancel() {
      // Client disconnected.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

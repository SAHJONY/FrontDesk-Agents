"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string; agent?: string };

const QUICK_REPLIES = ["Book a demo", "What does it cost?", "What can you do?", "Hola, ¿hablas español?"];

const GREETING: Msg = {
  role: "assistant",
  agent: "Greeting Agent",
  content:
    "Hello! I'm AVA, the FrontDesk Agents AI receptionist. Ask me anything — or try booking an appointment and watch me handle it end-to-end. I also speak Spanish. 🌎",
};

type HermesSummary = { online: boolean; modelCount: number };

// Map the message-level "agent" label coming from the API. The API may include
// internal provider/model names (e.g. "HERMES · NVIDIA NIM · meta/llama-3.3-70b-instruct");
// public surfaces show only the brand.
function publicAgentLabel(raw: string | undefined): string {
  if (!raw) return "AVA";
  if (raw.startsWith("HERMES")) return "HERMES";
  return raw;
}

export default function ChatWidget({ tall = false }: { tall?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [hermes, setHermes] = useState<HermesSummary>({ online: false, modelCount: 0 });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [booked, setBooked] = useState(false);
  const stateRef = useRef<unknown>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        if (d?.hermes) {
          setHermes({ online: Boolean(d.hermes.online), modelCount: Number(d.hermes.modelCount ?? 0) });
        }
      })
      .catch(() => {});
  }, []);

  const engineLabel = hermes.online
    ? `HERMES · ${hermes.modelCount} model${hermes.modelCount === 1 ? "" : "s"} online`
    : "HERMES · ready";

  function speak(text: string) {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.replace(/[✅🌎]/gu, ""));
    u.rate = 1.02;
    u.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput("");
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setBusy(true);
    try {
      const res = await fetch("/api/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, state: stateRef.current }),
      });
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      stateRef.current = data.state;
      setMessages((m) => [...m, { role: "assistant", content: data.reply, agent: data.agent }]);
      if (data.action?.type === "booking_confirmed") {
        setBooked(true);
        try {
          const log = JSON.parse(localStorage.getItem("fd_bookings") || "[]");
          log.unshift({ ...data.action.booking, createdAt: new Date().toISOString() });
          localStorage.setItem("fd_bookings", JSON.stringify(log.slice(0, 50)));
        } catch {}
      }
      speak(data.reply);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", agent: "System", content: "I hit a brief connection issue — please try that again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const SR =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!SR) {
      setMessages((m) => [
        ...m,
        { role: "assistant", agent: "System", content: "Voice input isn't supported in this browser — Chrome and Edge work great." },
      ]);
      return;
    }
    const rec = new SR() as {
      lang: string;
      interimResults: boolean;
      onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    };
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      send(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  return (
    <div className={`glass flex w-full flex-col overflow-hidden rounded-3xl ${tall ? "h-[70vh] min-h-[480px]" : "h-[520px]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-teal-glow/10 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/avatar.jpg" alt="AVA" className="h-10 w-10 rounded-full border border-gold/40 object-cover" />
            <span className="animate-pulse-glow absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-ink bg-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold">AVA · AI Receptionist</div>
            <div className="text-xs text-teal-glow" title={engineLabel}>Online — powered by {engineLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceOn((v) => !v)}
            className={`rounded-lg px-2.5 py-1.5 text-xs transition ${voiceOn ? "bg-teal-glow/20 text-teal-glow" : "text-slate-400 hover:text-slate-200"}`}
            title="Toggle voice replies"
          >
            {voiceOn ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} data-no-translate className="scrollbar-slim flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${m.role === "user" ? "" : ""}`}>
              {m.role === "assistant" && m.agent && (
                <div className="mb-1 text-[10px] font-medium uppercase tracking-widest text-gold/80">
                  {publicAgentLabel(m.agent)}
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-teal-glow/15 text-teal-50 border border-teal-glow/20"
                    : "bg-ink-3/80 border border-white/5 text-slate-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-ink-3/80 border border-white/5 px-4 py-3 w-fit">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-glow inline-block" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-glow inline-block" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-glow inline-block" />
          </div>
        )}
        {booked && (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-xs text-emerald-200">
            ✅ Appointment captured — see it on the <a href="/dashboard" className="underline">dashboard</a>.
          </div>
        )}
      </div>

      {/* Quick replies */}
      <div className="flex flex-wrap gap-2 px-5 pb-2">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={busy}
            className="rounded-full border border-teal-glow/25 px-3 py-1 text-xs text-teal-100/90 transition hover:bg-teal-glow/10 disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-teal-glow/10 px-4 py-3"
      >
        <button
          type="button"
          onClick={toggleMic}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            listening ? "bg-red-500/20 text-red-300 animate-pulse" : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
          title="Speak to AVA"
          aria-label="Voice input"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "Listening…" : "Type a message — try “book a demo”"}
          className="h-10 flex-1 rounded-xl border border-white/10 bg-ink-2/80 px-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-teal-glow/50"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-gold h-10 rounded-xl px-4 text-sm disabled:opacity-40">
          Send
        </button>
      </form>
    </div>
  );
}

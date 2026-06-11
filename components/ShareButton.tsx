"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = {
      title: "FrontDesk Agents — AI Receptionist",
      text: "Never miss a call again. The world's most advanced agentic AI receptionist — answers, books, and converts 24/7.",
      url: typeof window !== "undefined" ? window.location.origin : "",
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {
      /* user dismissed share sheet */
    }
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button onClick={share} className="btn-ghost rounded-xl px-4 py-2 text-sm" aria-label="Share this app">
      {copied ? "Link copied ✓" : "Share App"}
    </button>
  );
}

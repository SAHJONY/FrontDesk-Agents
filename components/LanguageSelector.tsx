"use client";

import { useState, useEffect } from "react";

export default function LanguageSelector() {
  const [lang, setLang] = useState<string>("en");

  // Persist choice in localStorage (simple placeholder)
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);

  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setLang(v);
    localStorage.setItem("lang", v);
    // In a real app you would trigger i18n reload here.
  };

  return (
    <select
      value={lang}
      onChange={change}
      className="ml-4 rounded bg-ink-2/30 px-2 py-1 text-sm text-slate-300 focus:outline-none"
      aria-label="Select language"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
      <option value="fr">FR</option>
      <option value="de">DE</option>
    </select>
  );
}

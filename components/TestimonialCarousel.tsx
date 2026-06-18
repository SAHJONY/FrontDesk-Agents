"use client";

import { useEffect, useState } from "react";

// Simple static testimonials – replace with real data later
const TESTIMONIALS = [
  {
    quote: "AVA booked us 30% more appointments in the first month.",
    name: "Laura M., Dental Clinic",
    avatar: "/testimonials/laura.jpg",
  },
  {
    quote: "Our lead conversion doubled after the 24/7 chat.",
    name: "Ravi K., Legal Services",
    avatar: "/testimonials/ravi.jpg",
  },
  {
    quote: "We stopped losing night‑time calls forever.",
    name: "Sofia G., Home Services",
    avatar: "/testimonials/sofia.jpg",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const { quote, name, avatar } = TESTIMONIALS[index];

  return (
    <section className="mx-auto max-w-3xl py-16 text-center">
      <blockquote className="relative rounded-2xl bg-ink-2/40 p-8 text-lg italic text-slate-300">
        <p>{"\""}{quote}{"\""}</p>
        <footer className="mt-6 flex items-center justify-center gap-3">
          <img src={avatar} alt={name} className="h-10 w-10 rounded-full" />
          <span className="font-medium text-slate-200">{name}</span>
        </footer>
      </blockquote>
    </section>
  );
}

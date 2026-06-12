import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import RoiCalculator from "@/components/RoiCalculator";

export const metadata: Metadata = {
  title: "Pricing & ROI Calculator | FrontDesk Agents",
  description: "Plans from free to $249/mo. See exactly how much missed inquiries cost your business with the live ROI calculator.",
};

export default function PricingPage() {
  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-6xl px-5 pt-32 pb-10 text-center">
        <h1 className="font-display text-4xl font-semibold md:text-6xl">
          Simple pricing. <span className="text-gradient-gold">Ruthless ROI.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Every plan includes 24/7 chat answering, the booking flow, and email summaries.
          Pay with Stripe, Square, or PayPal. Upgrade or cancel anytime.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <PricingCards />
      </section>
      <section className="border-y border-white/5 bg-ink-2/40 py-20">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center font-display text-3xl font-semibold md:text-4xl">
            What are missed calls <span className="text-gradient-gold">costing you?</span>
          </h2>
          <div className="mt-10">
            <RoiCalculator />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

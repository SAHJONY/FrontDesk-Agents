import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPlan } from "@/lib/plans";

type Search = { provider?: string; plan?: string; email?: string; session_id?: string };

function copyForProvider(provider: string, planName: string, email?: string) {
  switch (provider) {
    case "stripe":
      return {
        headline: "You're in",
        body: `Welcome to the ${planName} plan. Your card was charged and your AI receptionist is ready to go. We just emailed you a receipt and a link to your dashboard.`,
      };
    case "square":
      return {
        headline: "Subscription created",
        body: `Square just emailed your first invoice${email ? ` to ${email}` : ""}. Pay it from that email and your ${planName} plan activates automatically — usually within a minute.`,
      };
    case "paypal":
      return {
        headline: "PayPal approved",
        body: `Your ${planName} subscription is being finalized by PayPal. You'll get a confirmation email from them, and your plan activates as soon as the first charge clears.`,
      };
    default:
      return {
        headline: "Thank you",
        body: `Your ${planName} plan is being set up. You'll get an email shortly with next steps.`,
      };
  }
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const provider = params.provider ?? "unknown";
  const planId = params.plan ?? "";
  const plan = getPlan(planId);
  const planName = plan?.name ?? "your";
  const copy = copyForProvider(provider, planName, params.email);

  return (
    <main>
      <Nav />
      <section className="mx-auto flex min-h-[80vh] max-w-2xl items-center px-5 pt-32 pb-20">
        <div className="glass w-full rounded-3xl p-10 text-center">
          <div className="text-6xl">✨</div>
          <h1 className="mt-6 font-display text-4xl font-semibold">
            {copy.headline}. <span className="text-gradient-gold">Welcome aboard.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-300">{copy.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="btn-gold rounded-xl px-6 py-3 text-sm">
              Open dashboard →
            </Link>
            <Link href="/demo" className="btn-ghost rounded-xl px-6 py-3 text-sm">
              Try AVA now
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Questions? Reply to your receipt email and a human will get back to you.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

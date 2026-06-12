import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Search = { provider?: string; plan?: string };

export default async function CancelPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const planSlug = params.plan ?? "";

  return (
    <main>
      <Nav />
      <section className="mx-auto flex min-h-[80vh] max-w-2xl items-center px-5 pt-32 pb-20">
        <div className="glass w-full rounded-3xl p-10 text-center">
          <div className="text-5xl">🤔</div>
          <h1 className="mt-6 font-display text-4xl font-semibold">
            No charge. <span className="text-gradient-gold">No worries.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-300">
            Your checkout was cancelled and nothing was billed. You can pick a different plan,
            try a different payment method, or chat with AVA first — she'll answer any questions
            you have about pricing or features.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={planSlug ? `/pricing#${planSlug}` : "/pricing"}
              className="btn-gold rounded-xl px-6 py-3 text-sm"
            >
              Try again →
            </Link>
            <Link href="/demo" className="btn-ghost rounded-xl px-6 py-3 text-sm">
              Talk to AVA first
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

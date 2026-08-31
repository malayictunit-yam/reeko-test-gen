import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getSavedTests } from "@/lib/storage";
import { LANGUAGE_LABELS, type SampleTest } from "@/lib/test-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TestMakera — Sample tests from your lesson pointers" },
      {
        name: "description",
        content:
          "Grade school teachers: turn lesson pointers into multiple-choice tests in English, Tagalog, or Taglish and download them as PDF or Word.",
      },
      { property: "og:title", content: "TestMakera — Sample tests from your lesson pointers" },
      {
        property: "og:description",
        content: "Enter pointers, generate a test, review it, and download a print-ready sheet.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [saved, setSaved] = useState<SampleTest[]>([]);
  useEffect(() => setSaved(getSavedTests()), []);

  return (
    <AppShell>
      <div className="px-4 mt-6">
        <p className="font-marker text-accent text-sm -rotate-1 inline-block">para sa mga guro</p>
        <h1 className="font-display text-[2.4rem] leading-[0.95] mt-1">
          Turn your lesson pointers into a ready test.
        </h1>
        <p className="text-sm font-medium text-ink/70 mt-2">
          Type what you taught. Get multiple-choice questions with answers and short explanations —
          in English, Tagalog, or Taglish.
        </p>
      </div>

      <div className="px-4 mt-6">
        <div className="relative">
          <Link
            to="/create"
            className="block w-full text-center bg-accent text-cream border-2 border-ink font-display text-lg tracking-wide py-3.5 wob ink-shadow rotate-[-0.5deg]"
          >
            Start a new test
          </Link>
          <span className="absolute -top-3 right-2 font-marker text-ink text-sm rotate-6">
            3 steps lang!
          </span>
        </div>
      </div>

      <ol className="px-4 mt-8 space-y-3">
        {[
          ["1", "Enter your lesson pointers"],
          ["2", "Generate and review the questions"],
          ["3", "Download as PDF or Word"],
        ].map(([n, text], i) => (
          <li
            key={n}
            className={`flex items-center gap-3 bg-cream border-2 border-ink p-3 ${
              i % 2 ? "wob2 rotate-[0.4deg]" : "wob rotate-[-0.4deg]"
            }`}
          >
            <span className="size-7 shrink-0 grid place-items-center bg-ink text-cream font-marker text-sm">
              {n}
            </span>
            <span className="text-sm font-semibold">{text}</span>
          </li>
        ))}
      </ol>

      <section className="px-4 mt-8">
        <h2 className="font-display text-xl">Saved tests</h2>
        {saved.length === 0 ? (
          <p className="text-sm text-ink/60 mt-1">Wala pa. Your saved tests will show up here.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {saved.slice(0, 3).map((t) => (
              <li key={t.id} className="border-2 border-ink bg-cream wob3 p-3">
                <Link to="/saved" className="block">
                  <p className="font-semibold text-sm">{t.title}</p>
                  <p className="text-[12px] text-ink/60">
                    {t.subject} · {t.gradeLevel} · {t.questions.length} items ·{" "}
                    {LANGUAGE_LABELS[t.language]}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

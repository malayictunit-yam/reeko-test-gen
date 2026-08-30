import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, StepStrip } from "@/components/AppShell";
import { exportPdf, exportWord } from "@/lib/exporters";
import { getDraft, saveTest } from "@/lib/storage";
import { LANGUAGE_LABELS, type SampleTest } from "@/lib/test-types";

export const Route = createFileRoute("/export")({
  head: () => ({
    meta: [
      { title: "Download your test — TestMakera" },
      {
        name: "description",
        content: "Download your sample test as a print-ready PDF or an editable Word document.",
      },
      { property: "og:title", content: "Download your test — TestMakera" },
      { property: "og:description", content: "Export to PDF or Word, with or without answer key." },
    ],
  }),
  component: ExportPage,
});

function ExportPage() {
  const [test, setTest] = useState<SampleTest | null>(null);
  const [withKey, setWithKey] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => setTest(getDraft()), []);

  if (!test) {
    return (
      <AppShell>
        <div className="px-4 mt-8">
          <h1 className="font-display text-[2rem] leading-tight">Nothing to download yet</h1>
          <p className="text-sm text-ink/70 mt-2">Create or open a test first.</p>
          <Link
            to="/create"
            className="mt-5 inline-block bg-accent text-cream border-2 border-ink font-display text-base px-5 py-3 wob ink-shadow"
          >
            Create a test
          </Link>
        </div>
      </AppShell>
    );
  }

  const run = async (kind: "pdf" | "word") => {
    setBusy(kind);
    try {
      saveTest(test);
      if (kind === "pdf") await exportPdf(test, withKey);
      else await exportWord(test, withKey);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell>
      <StepStrip step={3} />

      <div className="px-4 mt-4">
        <p className="font-marker text-accent text-sm -rotate-1 inline-block">last step</p>
        <h1 className="font-display text-[2.15rem] leading-[0.95] mt-1">Download</h1>
        <p className="text-sm font-medium text-ink/70 mt-1">
          {test.title} · {test.questions.length} items · {LANGUAGE_LABELS[test.language]}
        </p>
      </div>

      <div className="px-4 mt-5">
        <button
          type="button"
          onClick={() => setWithKey((v) => !v)}
          className="w-full flex items-center justify-between bg-cream border-2 border-ink p-4 wob3"
        >
          <span className="text-left">
            <span className="block font-semibold text-sm">Include answer key</span>
            <span className="block text-[12px] text-ink/60">
              Added on a separate last page, with explanations.
            </span>
          </span>
          <span
            className={`size-7 shrink-0 grid place-items-center border-2 border-ink font-marker ${
              withKey ? "bg-accent text-cream" : "bg-cream text-ink/30"
            }`}
          >
            ✓
          </span>
        </button>
      </div>

      <div className="px-4 mt-5 space-y-3">
        <button
          onClick={() => run("pdf")}
          disabled={busy !== null}
          className="w-full bg-accent text-cream border-2 border-ink font-display text-lg tracking-wide py-3.5 wob ink-shadow rotate-[-0.5deg] disabled:opacity-60"
        >
          {busy === "pdf" ? "Preparing…" : "Download PDF"}
        </button>
        <button
          onClick={() => run("word")}
          disabled={busy !== null}
          className="w-full bg-cream text-ink border-2 border-ink font-display text-lg tracking-wide py-3.5 wob2 ink-shadow rotate-[0.4deg] disabled:opacity-60"
        >
          {busy === "word" ? "Preparing…" : "Download Word"}
        </button>
        <p className="text-center text-[12px] text-ink/60">
          Saved to your folder automatically when you download.
        </p>
      </div>

      <div className="px-4 mt-6">
        <Link
          to="/preview"
          className="text-[11px] font-bold uppercase tracking-wide border-b-2 border-ink/40 pb-0.5"
        >
          Back to review
        </Link>
      </div>
    </AppShell>
  );
}

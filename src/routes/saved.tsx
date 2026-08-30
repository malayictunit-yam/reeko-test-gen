import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { deleteTest, getSavedTests, setDraft } from "@/lib/storage";
import { LANGUAGE_LABELS, type SampleTest } from "@/lib/test-types";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved tests — TestMakera" },
      { name: "description", content: "Open, re-edit, or download the sample tests you saved." },
      { property: "og:title", content: "Saved tests — TestMakera" },
      { property: "og:description", content: "Your saved grade school sample tests." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<SampleTest[]>([]);

  useEffect(() => setTests(getSavedTests()), []);

  const open = (test: SampleTest) => {
    setDraft(test);
    navigate({ to: "/preview" });
  };

  const remove = (id: string) => {
    deleteTest(id);
    setTests(getSavedTests());
  };

  return (
    <AppShell>
      <div className="px-4 mt-6">
        <p className="font-marker text-accent text-sm -rotate-1 inline-block">your folder</p>
        <h1 className="font-display text-[2.15rem] leading-[0.95] mt-1">Saved tests</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {tests.length === 0 && (
          <p className="text-sm text-ink/60">
            Wala pang naka-save. Create a test and tap “Save test” in the preview screen.
          </p>
        )}
        {tests.map((t, i) => (
          <div
            key={t.id}
            className={`bg-cream border-2 border-ink p-4 ink-shadow ${
              i % 2 ? "wob2 rotate-[0.4deg]" : "wob3 rotate-[-0.4deg]"
            }`}
          >
            <p className="font-display text-lg leading-tight">{t.title}</p>
            <p className="text-[12px] text-ink/60 mt-0.5">
              {t.subject} · {t.gradeLevel} · {t.questions.length} items ·{" "}
              {LANGUAGE_LABELS[t.language]} · {new Date(t.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wide">
              <button onClick={() => open(t)} className="border-b-2 border-accent pb-0.5">
                Open
              </button>
              <button
                onClick={() => remove(t.id)}
                className="border-b-2 border-ink/40 pb-0.5 text-ink/60"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

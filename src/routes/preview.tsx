import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, StepStrip } from "@/components/AppShell";
import { getDraft, saveTest, setDraft } from "@/lib/storage";
import { LANGUAGE_LABELS, LETTERS, type Question, type SampleTest } from "@/lib/test-types";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Preview & edit — TestMakera" },
      {
        name: "description",
        content: "Review the generated questions, fix the wording, and set the correct answers.",
      },
      { property: "og:title", content: "Preview & edit — TestMakera" },
      { property: "og:description", content: "Review and edit your generated sample test." },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const navigate = useNavigate();
  const [test, setTest] = useState<SampleTest | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => setTest(getDraft()), []);

  const update = (next: SampleTest) => {
    setTest(next);
    setDraft(next);
  };

  const patchQuestion = (id: string, patch: Partial<Question>) => {
    if (!test) return;
    update({
      ...test,
      questions: test.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    });
  };

  const removeQuestion = (id: string) => {
    if (!test) return;
    update({ ...test, questions: test.questions.filter((q) => q.id !== id) });
  };

  if (!test) {
    return (
      <AppShell>
        <div className="px-4 mt-8">
          <h1 className="font-display text-[2rem] leading-tight">No test yet</h1>
          <p className="text-sm text-ink/70 mt-2">
            Generate one first, or open a saved test from your folder.
          </p>
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

  return (
    <AppShell>
      <StepStrip step={2} />

      <div className="px-4 mt-4">
        <p className="font-marker text-accent text-sm -rotate-1 inline-block">preview &amp; edit</p>
        <input
          value={test.title}
          onChange={(e) => update({ ...test, title: e.target.value })}
          className="w-full bg-transparent font-display text-[2.15rem] leading-[0.95] mt-1 outline-none focus:ring-2 focus:ring-accent"
          aria-label="Test title"
        />
        <p className="text-sm font-medium text-ink/70 mt-1">
          {test.gradeLevel} · {test.subject} · {test.questions.length} items ·{" "}
          {LANGUAGE_LABELS[test.language]}
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {test.questions.map((q, i) => {
          const isEditing = editing === q.id;
          return (
            <div
              key={q.id}
              className={`bg-cream border-2 border-ink p-4 ink-shadow ${
                i % 2 ? "wob rotate-[0.5deg]" : "wob3 rotate-[-0.6deg]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-marker text-lg text-accent">Q{i + 1}</span>
                <span className="text-[11px] font-bold bg-ink text-cream px-2 py-0.5 wob">
                  {LETTERS[q.answer]} is correct
                </span>
              </div>

              {isEditing ? (
                <textarea
                  value={q.stem}
                  rows={2}
                  onChange={(e) => patchQuestion(q.id, { stem: e.target.value })}
                  className="w-full bg-cream border-2 border-ink px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-accent"
                />
              ) : (
                <p className="font-semibold text-[15px] leading-snug">{q.stem}</p>
              )}

              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const correct = q.answer === oi;
                  return (
                    <div
                      key={oi}
                      className={`flex items-center gap-2.5 border-2 border-ink px-3 py-2.5 ${
                        oi % 2 ? "wob2" : "wob"
                      } ${correct ? "bg-accent text-cream ink-shadow-sm" : "bg-cream"}`}
                    >
                      <button
                        type="button"
                        onClick={() => patchQuestion(q.id, { answer: oi as 0 | 1 | 2 | 3 })}
                        aria-label={`Mark ${LETTERS[oi]} as correct`}
                        className={`size-6 shrink-0 grid place-items-center border-2 font-display text-sm ${
                          correct ? "border-cream bg-cream text-ink" : "border-ink"
                        }`}
                      >
                        {LETTERS[oi]}
                      </button>
                      {isEditing ? (
                        <input
                          value={opt}
                          onChange={(e) => {
                            const options = [...q.options] as Question["options"];
                            options[oi] = e.target.value;
                            patchQuestion(q.id, { options });
                          }}
                          className="flex-1 bg-transparent text-sm outline-none focus:ring-2 focus:ring-ink"
                        />
                      ) : (
                        <span className={`text-sm flex-1 ${correct ? "font-bold" : ""}`}>{opt}</span>
                      )}
                      {correct && <span className="font-marker text-sm">✓</span>}
                    </div>
                  );
                })}
              </div>

              {isEditing ? (
                <input
                  value={q.explanation}
                  placeholder="Short explanation (optional)"
                  onChange={(e) => patchQuestion(q.id, { explanation: e.target.value })}
                  className="mt-3 w-full bg-cream border-2 border-ink px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-accent"
                />
              ) : (
                q.explanation && (
                  <p className="mt-3 text-[13px] italic text-ink/80 border-l-[3px] border-accent pl-3">
                    {q.explanation}
                  </p>
                )
              )}

              <div className="mt-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-ink/60">
                <button
                  onClick={() => setEditing(isEditing ? null : q.id)}
                  className="border-b-2 border-accent pb-0.5"
                >
                  {isEditing ? "Done" : "Edit"}
                </button>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="border-b-2 border-ink/40 pb-0.5"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 space-y-3">
        <div className="relative">
          <button
            onClick={() => navigate({ to: "/export" })}
            className="w-full bg-accent text-cream border-2 border-ink font-display text-lg tracking-wide py-3.5 wob ink-shadow rotate-[-0.5deg]"
          >
            Export to PDF &amp; Word
          </button>
          <span className="absolute -top-3 -right-1 font-marker text-ink text-sm rotate-6">
            tap to save!
          </span>
        </div>
        <button
          onClick={() => {
            saveTest(test);
            setSavedNote(true);
          }}
          className="w-full bg-cream text-ink border-2 border-ink font-display text-base py-3 wob2"
        >
          {savedNote ? "Naka-save na ✓" : "Save test to my folder"}
        </button>
      </div>
    </AppShell>
  );
}

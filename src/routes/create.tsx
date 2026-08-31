import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, StepStrip } from "@/components/AppShell";
import { generateTest } from "@/lib/generate.functions";
import { setDraft } from "@/lib/storage";
import { LANGUAGE_LABELS, type LanguageMode, type SampleTest } from "@/lib/test-types";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a test — REEKO - TEST GENERATOR" },
      {
        name: "description",
        content:
          "Enter your subject, grade level, and lesson pointers to generate multiple-choice questions.",
      },
      { property: "og:title", content: "Create a test — REEKO - TEST GENERATOR" },
      {
        property: "og:description",
        content: "Enter lesson pointers and generate a sample test in seconds.",
      },
    ],
  }),
  component: CreatePage,
});

const SUBJECTS = ["Science", "Math", "English", "Filipino", "Araling Panlipunan", "MAPEH", "ESP"];
const GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

function CreatePage() {
  const navigate = useNavigate();
  const generate = useServerFn(generateTest);

  const [subject, setSubject] = useState("Science");
  const [gradeLevel, setGradeLevel] = useState("Grade 4");
  const [pointers, setPointers] = useState("");
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState<LanguageMode>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    if (pointers.trim().length < 5) {
      setError("Please write at least one lesson pointer.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await generate({
        data: { subject, gradeLevel, pointers: pointers.trim(), count, language },
      });
      const test: SampleTest = {
        id: crypto.randomUUID(),
        title: result.title,
        subject,
        gradeLevel,
        language,
        pointers: pointers.trim(),
        createdAt: new Date().toISOString(),
        questions: result.questions.map((q) => ({ ...q, id: crypto.randomUUID() })),
      };
      setDraft(test);
      navigate({ to: "/preview" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full bg-cream border-2 border-ink px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wide text-ink/60 mb-1.5";

  return (
    <AppShell>
      <StepStrip step={1} />

      <div className="px-4 mt-4">
        <p className="font-marker text-accent text-sm -rotate-1 inline-block">step one</p>
        <h1 className="font-display text-[2.15rem] leading-[0.95] mt-1">Lesson pointers</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="subject">
              Subject
            </label>
            <select
              id="subject"
              className={`${fieldClass} wob`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="grade">
              Grade level
            </label>
            <select
              id="grade"
              className={`${fieldClass} wob2`}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            >
              {GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="pointers">
            What did you teach?
          </label>
          <textarea
            id="pointers"
            rows={6}
            placeholder={"Parts of a plant and their function\nPhotosynthesis\nThe water cycle"}
            className={`${fieldClass} wob3 leading-relaxed`}
            value={pointers}
            onChange={(e) => setPointers(e.target.value)}
          />
          <p className="text-[12px] text-ink/60 mt-1">One pointer per line works best.</p>
        </div>

        <div>
          <label className={labelClass}>Number of questions</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCount((c) => Math.max(3, c - 1))}
              className="size-11 border-2 border-ink bg-cream font-display text-xl wob"
              aria-label="Fewer questions"
            >
              −
            </button>
            <span className="font-display text-2xl w-10 text-center">{count}</span>
            <button
              type="button"
              onClick={() => setCount((c) => Math.min(25, c + 1))}
              className="size-11 border-2 border-ink bg-cream font-display text-xl wob2"
              aria-label="More questions"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Language</label>
          <div className="flex items-center gap-2">
            {(["en", "tl", "mix"] as LanguageMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLanguage(mode)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide border-2 border-ink wob ${
                  language === mode ? "bg-ink text-cream" : "bg-cream text-ink"
                }`}
              >
                {LANGUAGE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm font-semibold text-accent border-l-[3px] border-accent pl-3">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="w-full bg-accent text-cream border-2 border-ink font-display text-lg tracking-wide py-3.5 wob ink-shadow rotate-[-0.5deg] disabled:opacity-60"
        >
          {loading ? "Sumusulat…" : "Generate test"}
        </button>
        {loading && (
          <p className="text-center font-marker text-sm text-ink/70">
            writing your questions, sandali lang…
          </p>
        )}
      </div>
    </AppShell>
  );
}

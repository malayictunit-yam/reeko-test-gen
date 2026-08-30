export type LanguageMode = "en" | "tl" | "mix";

export const LANGUAGE_LABELS: Record<LanguageMode, string> = {
  en: "English",
  tl: "Tagalog",
  mix: "Taglish",
};

export type Question = {
  id: string;
  stem: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

export type SampleTest = {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  language: LanguageMode;
  pointers: string;
  questions: Question[];
  createdAt: string;
};

export const LETTERS = ["A", "B", "C", "D"] as const;

import type { SampleTest } from "./test-types";

const DRAFT_KEY = "testmakera.draft";
const SAVED_KEY = "testmakera.saved";

const isBrowser = () => typeof window !== "undefined";

export function getDraft(): SampleTest | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as SampleTest) : null;
  } catch {
    return null;
  }
}

export function setDraft(test: SampleTest) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(test));
}

export function clearDraft() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function getSavedTests(): SampleTest[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as SampleTest[]) : [];
  } catch {
    return [];
  }
}

export function saveTest(test: SampleTest) {
  if (!isBrowser()) return;
  const all = getSavedTests().filter((t) => t.id !== test.id);
  all.unshift(test);
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(all));
}

export function deleteTest(id: string) {
  if (!isBrowser()) return;
  const all = getSavedTests().filter((t) => t.id !== id);
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(all));
}

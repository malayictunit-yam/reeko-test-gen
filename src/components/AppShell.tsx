import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", icon: "⌂", label: "Home" },
  { to: "/create", icon: "✎", label: "Create" },
  { to: "/preview", icon: "▤", label: "Preview" },
  { to: "/export", icon: "⬇", label: "Export" },
  { to: "/saved", icon: "★", label: "Saved" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="paper min-h-screen w-full text-ink font-body flex flex-col">
      <header className="px-4 pt-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="size-8 grid place-items-center bg-accent text-cream font-marker text-base rotate-[-6deg] wob">
            T
          </span>
          <div className="leading-none">
            <p className="font-display text-2xl tracking-tight">TestMakera</p>
            <p className="font-marker text-[11px] text-accent -mt-0.5">test builder for teachers</p>
          </div>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto pb-6">{children}</main>

      <nav className="sticky bottom-0 bg-ink text-cream flex items-stretch border-t-2 border-ink">
        {NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${
                active ? "text-accent" : "text-cream"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function StepStrip({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Pointers", "Review", "Download"] as const;
  return (
    <div className="px-4 mt-4 flex items-center gap-2">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n <= step;
        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <span
              className={`flex items-center gap-1.5 text-[11px] font-bold ${
                n === step ? "text-accent" : done ? "text-ink" : "text-brand/50"
              }`}
            >
              <span
                className={`size-5 grid place-items-center font-marker text-xs ${
                  done ? "bg-accent text-cream" : "border-2 border-brand text-brand"
                }`}
              >
                {n}
              </span>
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="flex-1 border-t-2 border-dotted border-brand/40" />
            )}
          </div>
        );
      })}
    </div>
  );
}

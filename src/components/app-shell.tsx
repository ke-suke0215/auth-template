import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#F5F5F4] font-sans text-[#111111] antialiased">
      <header className="flex h-16 items-center justify-between border-b border-[#111111] bg-[#111111] px-5 text-[#FFFFFF] md:hidden">
        <span className="text-xs font-semibold tracking-[0.2em]">AUTH TEMPLATE</span>
        <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-[#E7E5E4]">SECURE</span>
      </header>

      <div className="md:grid md:min-h-dvh md:grid-cols-[7.5rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#111111] bg-[#111111] text-[#FFFFFF] md:flex" aria-label="Auth Template">
          <div className="flex w-full flex-col items-center justify-between px-5 py-7">
            <div className="flex flex-col items-center gap-5">
              <span className="h-2.5 w-2.5 bg-[#FFFFFF]" aria-hidden="true" />
              <span className="[writing-mode:vertical-rl] text-[0.6875rem] font-semibold tracking-[0.22em]">
                AUTH TEMPLATE
              </span>
            </div>
            <span className="[writing-mode:vertical-rl] font-mono text-[0.625rem] tracking-[0.16em] text-[#E7E5E4]">
              SECURE ACCESS
            </span>
          </div>
        </aside>

        <main className="flex min-h-[calc(100dvh-4rem)] items-center px-5 py-10 sm:px-10 sm:py-14 md:min-h-dvh md:px-16 lg:px-24">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#F5F5F4] font-sans text-[#111111] antialiased">
      <main className="flex min-h-dvh items-center px-5 py-10 sm:px-10 sm:py-14">
        <div className="flex w-full justify-center">{children}</div>
      </main>
    </div>
  );
}

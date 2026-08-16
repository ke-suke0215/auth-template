import { Link } from "react-router-dom";

import { AppShell } from "../components/app-shell";

export function NotFoundPage() {
  return (
    <AppShell>
      <section
        className="w-full max-w-md border-y border-[#E7E5E4] bg-[#FFFFFF] px-6 py-8 sm:px-8 sm:py-10"
        aria-labelledby="not-found-title"
      >
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-[#57534E]">404 / NOT FOUND</p>
        <h1 id="not-found-title" className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          ページが見つかりません
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#57534E]">
          指定されたページは存在しないか、移動された可能性があります。
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-11 items-center border border-[#111111] px-5 text-sm font-semibold transition-colors hover:bg-[#F5F5F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] motion-reduce:transition-none"
        >
          ホームへ戻る
        </Link>
      </section>
    </AppShell>
  );
}

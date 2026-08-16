import { useState } from "react";
import { Navigate } from "react-router-dom";

import { AppShell } from "../components/app-shell";
import { StatusMessage } from "../components/status-message";
import { authClient } from "../lib/auth-client";

export function LoginPage() {
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (isPending) {
    return (
      <AppShell>
        <StatusMessage label="セッションを確認しています…" />
      </AppShell>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  async function signInWithGoogle() {
    setError(null);
    setIsSigningIn(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        setError(result.error.message ?? "Google ログインを開始できませんでした。");
        setIsSigningIn(false);
      }
    } catch {
      setError("Google ログインを開始できませんでした。");
      setIsSigningIn(false);
    }
  }

  return (
    <AppShell>
      <section
        className="w-full max-w-md border-y border-[#E7E5E4] bg-[#FFFFFF] px-6 py-8 sm:px-8 sm:py-10"
        aria-labelledby="login-title"
      >
        <p className="text-xs font-semibold tracking-[0.16em] text-[#57534E]">AUTH TEMPLATE</p>
        <h1 id="login-title" className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          ログイン
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#57534E]">Google アカウントを使って、安全に続行します。</p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          disabled={isSigningIn}
          aria-describedby={error ? "login-error" : undefined}
          className="mt-8 flex min-h-11 w-full items-center justify-center border border-[#111111] bg-[#111111] px-5 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#57534E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] disabled:cursor-wait disabled:bg-[#57534E] motion-reduce:transition-none"
        >
          {isSigningIn ? "Google へ移動しています…" : "Google でログイン"}
        </button>
        {error ? (
          <p
            id="login-error"
            className="mt-5 border-l-2 border-[#111111] pl-3 text-sm leading-6"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        ) : null}
      </section>
    </AppShell>
  );
}

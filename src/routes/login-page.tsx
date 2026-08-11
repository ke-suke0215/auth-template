import { useState } from "react";
import { Navigate } from "react-router-dom";

import { authClient } from "../lib/auth-client";

export function LoginPage() {
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (isPending) {
    return <main className="page">セッションを確認しています…</main>;
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
    <main className="page">
      <section className="card" aria-labelledby="login-title">
        <p className="eyebrow">Auth Template</p>
        <h1 id="login-title">ログイン</h1>
        <p>Google アカウントでログインします。</p>
        <button type="button" onClick={() => void signInWithGoogle()} disabled={isSigningIn}>
          {isSigningIn ? "Google へ移動しています…" : "Google でログイン"}
        </button>
        {error ? <p className="error" role="alert">{error}</p> : null}
      </section>
    </main>
  );
}

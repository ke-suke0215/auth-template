import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppShell } from "../components/app-shell";
import { StatusMessage } from "../components/status-message";
import { apiClient } from "../lib/api-client";
import { authClient } from "../lib/auth-client";

type Me = {
  email: string;
  id: string;
};

export function HomePage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const response = await apiClient.api.me.$get();

        if (response.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error("ユーザー情報を取得できませんでした。");
        }

        const user = await response.json();
        if (!cancelled) {
          setMe(user);
        }
      } catch {
        if (!cancelled) {
          setError("ユーザー情報を取得できませんでした。");
        }
      }
    }

    void loadMe();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function signOut() {
    setError(null);
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message ?? "ログアウトできませんでした。");
        setIsSigningOut(false);
        return;
      }

      navigate("/login", { replace: true });
    } catch {
      setError("ログアウトできませんでした。");
      setIsSigningOut(false);
    }
  }

  return (
    <AppShell>
      <section className="w-full max-w-2xl" aria-labelledby="home-title">
        <div className="border-b border-[#111111] pb-7 sm:pb-9">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#57534E]">ACCOUNT</p>
          <h1 id="home-title" className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            ログイン済み
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#57534E]">現在ログインしているアカウントを確認できます。</p>
        </div>
        {me ? (
          <dl className="border-b border-[#E7E5E4] bg-[#FFFFFF]">
            <div className="grid gap-2 border-b border-[#E7E5E4] px-5 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6 sm:px-6">
              <dt className="text-xs font-semibold tracking-[0.12em] text-[#57534E]">ID</dt>
              <dd className="break-all text-sm leading-6">{me.id}</dd>
            </div>
            <div className="grid gap-2 px-5 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6 sm:px-6">
              <dt className="text-xs font-semibold tracking-[0.12em] text-[#57534E]">EMAIL</dt>
              <dd className="break-all text-sm leading-6">{me.email}</dd>
            </div>
          </dl>
        ) : (
          <div className="pt-6">
            <StatusMessage label="ユーザー情報を取得しています…" />
          </div>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          disabled={isSigningOut}
          aria-describedby={error ? "home-error" : undefined}
          className="mt-7 min-h-11 border border-[#111111] bg-[#FFFFFF] px-5 text-sm font-semibold transition-colors hover:bg-[#F5F5F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] disabled:cursor-wait disabled:border-[#57534E] disabled:text-[#57534E] motion-reduce:transition-none"
        >
          {isSigningOut ? "ログアウトしています…" : "ログアウト"}
        </button>
        {error ? (
          <p id="home-error" className="mt-5 border-l-2 border-[#111111] pl-3 text-sm leading-6" role="alert" aria-live="assertive">
            {error}
          </p>
        ) : null}
      </section>
    </AppShell>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <main className="page">
      <section className="card" aria-labelledby="home-title">
        <p className="eyebrow">Auth Template</p>
        <h1 id="home-title">ログイン済み</h1>
        {me ? (
          <dl>
            <div>
              <dt>ID</dt>
              <dd>{me.id}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{me.email}</dd>
            </div>
          </dl>
        ) : (
          <p>ユーザー情報を取得しています…</p>
        )}
        <button type="button" onClick={() => void signOut()} disabled={isSigningOut}>
          {isSigningOut ? "ログアウトしています…" : "ログアウト"}
        </button>
        {error ? <p className="error" role="alert">{error}</p> : null}
      </section>
    </main>
  );
}

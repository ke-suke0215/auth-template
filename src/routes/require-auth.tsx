import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { authClient } from "../lib/auth-client";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <main className="page">セッションを確認しています…</main>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

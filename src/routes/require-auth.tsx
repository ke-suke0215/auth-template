import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { AppShell } from "../components/app-shell";
import { StatusMessage } from "../components/status-message";
import { authClient } from "../lib/auth-client";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <AppShell>
        <StatusMessage label="セッションを確認しています…" />
      </AppShell>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

import { Route, Routes } from "react-router-dom";

import { HomePage } from "./home-page";
import { LoginPage } from "./login-page";
import { NotFoundPage } from "./not-found-page";
import { RequireAuth } from "./require-auth";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

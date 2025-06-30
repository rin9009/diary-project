// AppRouter.jsx (라우터)

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DiaryListPage from "../pages/DiaryListPage";
import DiaryWritePage from "../pages/DiaryWritePage";
import SignupPage from "../pages/SignupPage";
import AnonymousPage from "../pages/AnonymousPage";
import FindAccountPage from "../pages/FindAccountPage";
import PrivateRoute from "../components/PrivateRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DiaryListPage />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/anonymous" element={<AnonymousPage />} />
        <Route path="/find-account" element={<FindAccountPage />} />
        <Route
          path="/diary/write"
          element={
            <PrivateRoute>
              <DiaryWritePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

// AppRouter.jsx (라우터)

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SaveProvider } from "../contexts/SaveContext";
import LoginPage from "../pages/LoginPage";
import DiaryListPage from "../pages/DiaryListPage";
import DiaryWritePage from "../pages/DiaryWritePage";
import DiaryUpdatePage from "../pages/DiaryUpdatePage";
import SignupPage from "../pages/SignupPage";
import AnonymousPage from "../pages/AnonymousPage";
import DiaryReadPage from "../pages/DiaryReadPage";
import FindAccountPage from "../pages/FindAccountPage";
import PrivateRoute from "../components/PrivateRoute";
import Header from "../components/Header";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <SaveProvider>
        {" "}
        {/* 헤더 중복 방지를 위해 */}
        <Header />
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
          <Route
            path="/diary/read/:id" // 동적 파라미터
            element={
              <PrivateRoute>
                <DiaryReadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/diary/update/:id"
            element={
              <PrivateRoute>
                <DiaryUpdatePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </SaveProvider>
    </BrowserRouter>
  );
}

// PrivateRoute.jsx(라우트 보호 컴포넌트)

import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const userToken = sessionStorage.getItem("userToken");
  const anonymousNickname = localStorage.getItem("anonymousNickname");
  const nickname = localStorage.getItem("nickname");
  const diary = localStorage.getItem("diaryContent");

  if (userToken || anonymousNickname || (nickname && diary)) {
    return children;
  } else {
    return <Navigate to="/login" replace />;
  }
}

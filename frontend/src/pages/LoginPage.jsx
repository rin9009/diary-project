// LoginPage.jsx(로그인/익명(선택) 페이지)

import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // error 상태가 바뀔 때마다 콘솔로 확인
  useEffect(() => {
    console.log("에러 메시지 변경됨:", error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/login", {
        userId,
        password,
      });
      const token = res.data.token;

      // 로그인 성공 시 토큰을 받아 sessionStorage에 저장하여 홈 페이지로 이동할 수 있게 함
      sessionStorage.setItem("userToken", token);

      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("아이디나 비밀번호가 틀렸습니다.");
        alert("로그인 실패! 다시 시도해주세요");

        setUserId("");
        setPassword("");
      } else {
        setError("서버 오류가 발생했습니다.");
      }

      console.error(error);
    }
  };

  const handleAnonymous = () => {
    navigate("/anonymous");
  };

  return (
    <div>
      <h1>Login</h1>
      <form action="/login" method="post" onSubmit={handleSubmit}>
        <input
          type="text"
          value={userId}
          placeholder="아이디"
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          type="password"
          value={password}
          placeholder="비밀번호"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>
      <div>
        <Link to={"/find-account"}>아이디 • 비밀번호 찾기</Link>
        <Link to={"/signup"}>회원가입</Link>
      </div>
      <br />
      <hr />
      <br />
      <button onClick={handleAnonymous}>익명으로 시작하기</button>
    </div>
  );
}

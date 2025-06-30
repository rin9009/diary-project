// AnonymousPage.jsx(회원가입 페이지)

import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AnonymousPage() {
  const navigate = useNavigate();
  const [anonymousNickname, setAnonymousNickname] = useState("");

  const handleAnonymousJoin = async (e) => {
    e.preventDefault();

    if (anonymousNickname.trim() === "") {
      alert("닉네임을 입력해주세요!");
      return;
    }

    localStorage.setItem("anonymousNickname", anonymousNickname);

    navigate("/");
  };

  return (
    <div>
      <h1>Anonymous</h1>
      <form action="/anonymous" method="post" onSubmit={handleAnonymousJoin}>
        <input
          type="text"
          value={anonymousNickname}
          placeholder="닉네임"
          onChange={(e) => setAnonymousNickname(e.target.value)}
        />
        <button type="submit">시작하기</button>
      </form>
    </div>
  );
}

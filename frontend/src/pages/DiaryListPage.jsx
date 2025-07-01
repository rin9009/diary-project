// DiaryListPage.jsx(일기장 목록 페이지 - 홈 페이지)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getDiaries } from "../utils/storage";

export default function DiaryListPage() {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();
  const [diaries, setDiaries] = useState([]);

  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const token = sessionStorage.getItem("userToken");
        const res = await axios.get("/api/userinfo", {
          // 토큰을 보내는 표준적인 방식(Authorization라는 HTTP 표준 헤더에 Bearer {token} 이라는 형태로 내가 로그인해서 받은 JWT 토큰을 담아서 보냄)
          headers: { Authorization: `Bearer ${token}` },
        });

        setNickname(res.data.nickname);
      } catch (e) {
        // 로그인 사용자가 아니거나(익명 사용자거나), 서버 요청이 실패하면
        const anonymousNickname = localStorage.getItem("anonymousNickname");

        if (anonymousNickname) {
          setNickname(anonymousNickname);
        } else {
          console.error(e);
        }
      }
    };

    const fetchDiaryContent = async () => {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        const anonymousDiaries = getDiaries();
        if (anonymousDiaries) {
          setDiaries(anonymousDiaries);
        } else {
          setDiaries(null);
        }
        return;
      }

      try {
        const res = await axios.get("/api/diaryinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDiaries(res.data.contents);
        console.log(res.data.contents);
      } catch (e) {
        console.error(e);
        setDiaries(null);
      }
    };

    fetchNickname();
    fetchDiaryContent();
  }, []);

  const handleAdd = () => {
    navigate("/diary/write");
  };

  return (
    <div>
      <div>
        <div>
          <img src="/" />
        </div>
        <div>
          <h3>'사진 일기'</h3>
        </div>

        <h3>{nickname}님</h3>
      </div>

      <div>
        {diaries && diaries.length > 0 ? (
          <ul>
            {diaries.map((item) => (
              <a href={`/diary/read/${item.id}`} key={item.id}>
                <li>
                  <h4>{item.title}</h4>
                  <p>{item.content}...</p>
                  <small>{item.created_at}</small>
                </li>
              </a>
            ))}
          </ul>
        ) : (
          <div>
            <button onClick={handleAdd}>+</button>
            <h3>+버튼을 눌러 일기를 추가할 수 있습니다</h3>
          </div>
        )}
      </div>
    </div>
  );
}

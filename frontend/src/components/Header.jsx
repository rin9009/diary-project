// Header.jsx(헤더부분)

import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  // 직접 파싱
  const pathSegments = location.pathname.split("/");
  let diaryId = null;
  if (pathSegments[1] === "diary" && pathSegments[2] === "read") {
    diaryId = pathSegments[3];
  }

  // console.log(diaryId);

  const handleUpdate = () => {
    if (diaryId) {
      navigate(`/diary/update/${diaryId}`);
    }
  };

  // console.log(location.pathname);

  return (
    <header>
      <div>
        <h1>로그</h1>
      </div>
      <div>
        {location.pathname === "/" ? (
          <div>
            <button>
              <Link to={"/diary/write"}>추가</Link>
            </button>
            <button>설정</button>
          </div>
        ) : location.pathname.startsWith("/diary/read") ? (
          <div>
            <button onClick={handleUpdate}>수정</button>
            <button>
              <Link to={"/"}>닫기</Link>
            </button>
          </div>
        ) : location.pathname.startsWith("/diary/update") ||
          location.pathname.startsWith("/diary/write") ? (
          <div>
            <button>저장</button>
            <button>
              <Link to={"/"}>닫기</Link>
            </button>
          </div>
        ) : (
          <div>
            <button>설정</button>
          </div>
        )}
      </div>
    </header>
  );
}

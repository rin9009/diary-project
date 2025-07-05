// Header.jsx(헤더부분)

import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  console.log(location.pathname);

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
            <button>
              <Link to={"/diary/update"}>수정</Link>
            </button>
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

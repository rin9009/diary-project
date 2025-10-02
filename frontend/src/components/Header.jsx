// Header.jsx(헤더부분)

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSaveHandler } from "../contexts/SaveContext";
import axios from "axios";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveHandler } = useSaveHandler(); // 저장 함수 가져오기

  const showSave =
    location.pathname.startsWith("/diary/write") ||
    location.pathname.startsWith("/diary/update");

  // 직접 파싱
  const pathSegments = location.pathname.split("/");
  let diaryId = null;
  if (pathSegments[1] === "diary" && pathSegments[2] === "read") {
    diaryId = pathSegments[3];
  }

  // console.log(diaryId);

  // 일기 수정 페이지로 이동
  const handleUpdate = () => {
    if (diaryId) {
      navigate(`/diary/update/${diaryId}`);
    }
  };

  // 일기 삭제 페이지로 이동
  const handleDelete = () => {
    if (diaryId) {
      navigate(`/diary/delete/${diaryId}`);
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
            <button onClick={handleDelete}>삭제</button>
            <button>
              <Link to={"/"}>닫기</Link>
            </button>
          </div>
        ) : showSave ? (
          <div>
            <button onClick={saveHandler}>저장</button>
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

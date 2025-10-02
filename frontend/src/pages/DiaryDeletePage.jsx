// DiaryDeletePage.jsx 일기 삭제 페이지

import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function DiaryDeletePage() {
  const { id } = useParams(); // URL에서 diary id 가져오기
  const navigate = useNavigate();
  const attempted = useRef(false); // confirm 한 번만 띄우기

  useEffect(() => {
    if (attempted.current) return; // 이미 시도했으면 실행 안 함
    attempted.current = true;

    const deleteDiary = async () => {
      if (!window.confirm("정말 삭제하시겠습니까?")) {
        navigate(`/diary/read/${id}`); // 취소 시 읽기 페이지로 이동
        return;
      }

      try {
        const token = sessionStorage.getItem("userToken");
        await axios.delete(`/api/diary/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("삭제되었습니다.");
        navigate("/"); // 삭제 후 목록 페이지로 이동
      } catch (error) {
        console.error(error);
        alert("삭제 실패: 권한이 없거나 서버 오류");
        navigate(`/diary/read/${id}`); // 실패 시 읽기 페이지
      }
    };

    deleteDiary();
  }, [id, navigate]);

  return <p>삭제 처리 중...</p>;
}

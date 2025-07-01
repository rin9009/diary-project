// DiaryReadPage.jsx(일기 보는 페이지)

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DiaryReadPage() {
  const { id } = useParams(); // 받아온 id
  const [diary, setDiary] = useState(null);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const token = sessionStorage.getItem("userToken");
        const res = await axios.get(`/api/diary/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDiary(res.data);
        // console.log(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDiary();
  }, [id]);

  return (
    <div>
      {diary ? (
        <div>
          <div>
            <h2>{diary.title}</h2>
            <div>
              <time>
                <h5>{diary.created_at}</h5>
              </time>
              <h5>{diary.weather}</h5>
            </div>
            <div>
              <img
                src={`http://localhost:5000/${diary.photo_path}`}
                alt="일기 사진"
                width="300"
              />
            </div>
          </div>
          <article>
            <p>{diary.content}</p>
          </article>
        </div>
      ) : (
        <p>로딩중입니다...</p>
      )}
    </div>
  );
}

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
        console.log(res.data);
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
              {diary.photo_paths && diary.photo_paths.length > 0 ? (
                diary.photo_paths.map((path, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000/${path}`}
                    alt="일기 사진"
                    style={{ width: "300px", marginRight: "10px" }}
                  />
                ))
              ) : (
                <div>
                  <button>+</button>
                  <h3>+버튼을 눌러 사진을 추가할 수 있습니다</h3>
                </div>
              )}
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

// DiaryWritePage.jsx(일기장 작성(폼) 페이지)

import { useEffect, useState, useRef, useCallback } from "react";
import { saveDiary } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import { fetchWeather, dfs_xy_conv } from "../utils/getWeather";
import { useSaveHandler } from "../contexts/SaveContext";
import axios from "axios";

export default function DiaryWritePage() {
  const fileInputRef = useRef(null); // 파일 input DOM을 가리키는 ref
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [weather, setWeather] = useState("");
  const navigate = useNavigate();
  const [todayDate, setTodayDate] = useState(() => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst;
  }); // 오늘 날짜 기본(toISOString -> UTC라 9시간이 밀려, 한국 기준으로 바꿔줌)
  const [dateStr, setDateStr] = useState(todayDate.toISOString().slice(0, 10));
  const { setSaveHandler } = useSaveHandler();
  const [previewURLs, setPreviewURLs] = useState([]);

  const handleSubmit = useCallback(
    // 무한 렌더링/상태 업데이트 오류로 useCallback 추가
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("created_at", dateStr); // yyyy-mm-dd
      formData.append("weather", weather);
      selectedFiles.forEach((file) => {
        formData.append("file", file);
      });

      try {
        const token = sessionStorage.getItem("userToken");
        const res = await axios.post("/api/diary/write", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data.message);
        if (res.data.success) {
          alert("일기 등록 성공!");
          // 페이지 이동 등 처리
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        alert("등록 중 오류 발생");
      }
    },
    [title, content, dateStr, weather, selectedFiles]
  );

  const removePhoto = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handlePlusClick = () => {
    fileInputRef.current.click(); // 버튼 클릭 시 file input 클릭을 강제로 발생
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  function getBaseTime() {
    const now = new Date();
    const hours = now.getHours();
    let baseHour = hours;

    // 3시간 단위로 내림
    baseHour = Math.floor(baseHour / 3) * 3;
    // 30분 고정
    const baseTimeStr = baseHour.toString().padStart(2, "0") + "30";

    // console.log(baseTimeStr);

    return baseTimeStr;
  }

  // 위치, 날짜, 시간 정보 날씨 API에 보내서 날씨 정보 가져오기
  useEffect(() => {
    const yyyyMMdd = todayDate.toISOString().slice(0, 10).replace(/-/g, ""); // 날짜
    const baseTime = getBaseTime(); // 시간
    // const baseTime = "1500";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nx = position.coords.latitude;
          const ny = position.coords.longitude;
          // const nx = 38.0684; // 샘플(강원도 인제)
          // const ny = 128.1707; // 샘플(강원도 인제)
          const { x, y } = dfs_xy_conv(nx, ny);
          // console.log(dateStr);
          fetchWeather(yyyyMMdd, baseTime, x, y).then(setWeather);
        },
        (error) => {
          console.error("위치 정보 에러:", error);
        }
      );
    } else {
      console.error("이 브라우저는 geolocation을 지원하지 않음");
    }
  }, [todayDate]);

  // 1분마다 현재 날짜 확인
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const nowStr = kst.toISOString().slice(0, 10);
      const todayStr = todayDate.toISOString().slice(0, 10);

      if (nowStr !== todayStr) {
        // 날짜가 바뀐 경우
        setTodayDate(kst);
        setDateStr(nowStr);
      }
    }, 60 * 1000); // 1분마다 체크

    return () => clearInterval(timer);
  }, [todayDate]);

  // URL.createObjectURL() 정리
  useEffect(() => {
    const newURLs = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewURLs(newURLs);

    return () => {
      newURLs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  useEffect(() => {
    setSaveHandler(() => handleSubmit); // 저장 함수 등록
  }, [handleSubmit]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
        />
        <div>
          <h5>{dateStr}</h5>
          <h5>{weather}</h5>
        </div>
        <div>
          <button
            type="button"
            onClick={handlePlusClick}
            style={{ fontSize: "2rem" }}
          >
            +
          </button>
          <h3>+버튼을 눌러 사진을 추가할 수 있습니다</h3>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            ref={fileInputRef} // ref로 연결
            style={{ display: "none" }}
          />
          {selectedFiles.length > 0 && (
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              {selectedFiles.map((file, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={previewURLs[index]}
                    alt={`preview-${index}`}
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="일기"
            rows="10"
            cols="50"
          ></textarea>
        </div>
      </form>
    </div>
  );
}

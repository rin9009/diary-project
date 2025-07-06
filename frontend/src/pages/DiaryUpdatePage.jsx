// DiaryUdatePage.jsx(일기장 수정 페이지)

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DiaryUpdatePage() {
  const { id } = useParams(); // 받아온 id
  const [diaryToUpdate, setDiaryToUpdate] = useState(null);

  console.log(id);

  return (
    <div>
      <div>
        <h2>
          <input type="text" />
        </h2>
      </div>
    </div>
  );
}

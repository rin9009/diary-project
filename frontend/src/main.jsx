// main.jsx(App을 렌더링)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

// ReactDOM : 실제 브라우저의 DOM에 연결해 주는 역할(가상 DOM만으로는 화면에 아무것도 안 보이기 때문에 화면에 렌더링하도록 브라우저에 전달해줘야 한다)
ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode : 개발(디버그) 전용 도구같은 것이다(useEffect, useState 초기화 같은 걸 의도적으로 두 번 실행해 → 부작용(side effect)이 안전한지 확인하기 위해서 쓴다)
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

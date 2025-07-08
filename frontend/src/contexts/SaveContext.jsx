// SaveContext.jsx(저장 함수 전역 관리용 Context)

import { createContext, useContext, useState } from "react";

const SaveContext = createContext();

export function SaveProvider({ children }) {
  const [saveHandler, setSaveHandler] = useState(null);

  return (
    <SaveContext.Provider value={{ saveHandler, setSaveHandler }}>
      {children}
    </SaveContext.Provider>
  );
}

export const useSaveHandler = () => useContext(SaveContext);

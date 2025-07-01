// 키 값 일관성 있게 상수로 관리
const DIARY_KEY = "anonymousDiaries";

// READ
export function getDiaries() {
  try {
    const data = localStorage.getItem(DIARY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("로컬스토리지 읽기 오류", e);
    return [];
  }
}

// CREATE
export function saveDiary(newDiary) {
  try {
    const diaries = getDiaries();
    diaries.push(newDiary);
    localStorage.setItem(DIARY_KEY, JSON.stringify(diaries));
  } catch (e) {
    console.error("로컬스토리지 저장 오류", e);
  }
}

// UPDATE
export function updateDiary(updatedDiary) {
  try {
    const diaries = getDiaries().map((d) =>
      d.id === updatedDiary.id ? updatedDiary : d
    );
    localStorage.setItem(DIARY_KEY, JSON.stringify(diaries));
  } catch (e) {
    console.error("로컬스토리지 업데이트 오류", e);
  }
}

// DELETE
export function deleteDiary(id) {
  try {
    const diaries = getDiaries().filter((d) => d.id !== id);
    localStorage.setItem(DIARY_KEY, JSON.stringify(diaries));
  } catch (e) {
    console.error("로컬스토리지 삭제 오류", e);
  }
}

// All DELETE
export function clearDiaries() {
  localStorage.removeItem(DIARY_KEY);
}

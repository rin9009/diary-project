// getWeather.js

import axios from "axios";

/**
 * 공공데이터포털 기상청 날씨 API 호출
 * @param {string} date - yyyyMMdd
 * @param {string} time - HHmm
 * @param {string} nx - X좌표 (격자)
 * @param {string} ny - Y좌표 (격자)
 * @returns {Promise<string>} - 예: "맑음" / "흐림" / "비"
 */

// 위경도 → 격자좌표 변환 공식
export function dfs_xy_conv(lat, lon) {
  const RE = 6371.00877; // Earth radius (km)
  const GRID = 5.0; // Grid spacing (km)
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43; // (GRID)
  const YO = 136; // (GRID)

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  return { x, y };
}

export async function fetchWeather(date, time, nx, ny) {
  const serviceKey = import.meta.env.VITE_WEATHER_API_KEY;
  const url =
    "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";

  try {
    const response = await axios.get(url, {
      params: {
        serviceKey: serviceKey,
        pageNo: 1,
        numOfRows: 1000,
        dataType: "JSON",
        base_date: date,
        base_time: time,
        nx,
        ny,
      },
    });

    // 응답 파싱 예시
    const items = response.data.response.body.items.item;
    console.log(items);

    const weatherItemPty = items.find((item) => item.category === "PTY"); // 강수 형태
    const weatherItemSky = items.find((item) => item.category === "SKY"); // 하늘 상태

    let result = "데이터 없음";

    if (weatherItemPty) {
      const ptyValue = weatherItemPty.fcstValue;
      switch (ptyValue) {
        case "1":
          result = "비";
          break;
        case "2":
          result = "비/눈";
          break;
        case "3":
          result = "눈";
          break;
        case "0":
        default:
          // 강수가 없으면 SKY 값으로
          if (weatherItemSky) {
            const skyValue = weatherItemSky.fcstValue;
            switch (skyValue) {
              case "1":
                result = "맑음";
                break;
              case "3":
                result = "구름 많음";
                break;
              case "4":
                result = "흐림";
                break;
              default:
                result = "알수없음";
            }
          }
          break;
      }
    }
    console.log("파싱된 날씨 결과:", result);
    return result;
  } catch (e) {
    console.error("날씨 API 호출 실패:", e);
    return "에러";
  }
}

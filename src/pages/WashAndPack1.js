import React, { useEffect, useState } from "react";
import FlightTable from "../components/FlightTable";

const calcTime = (baseDate, timeStr, offsetHours) => {
  if (!timeStr) return null;
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const dateObj = new Date(baseDate);
  dateObj.setHours(hours);
  dateObj.setMinutes(minutes);
  dateObj.setSeconds(seconds || 0);
  dateObj.setHours(dateObj.getHours() + offsetHours);
  return dateObj;
};

const formatTime = (dateObj) => {
  if (!dateObj) return "-";
  const h = String(dateObj.getHours()).padStart(2, "0");
  const m = String(dateObj.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const WashAndPack2 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const extractTime = (timeStr) => {
    if (!timeStr) return null;

    // ISO 형식 (1900-01-01T09:00:00)
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1];
      const parts = timePart.split(":");
      if (parts.length >= 2) {
        return `${parts[0].padStart(2,"0")}:${parts[1].padStart(2,"0")}`;
      }
    }
  
    // 기존 "HH:mm:ss" 또는 "HH:mm" 형식
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2,"0")}:${parts[1].padStart(2,"0")}`;
    }
  
    return null;
  };
  
  // ✅ 백엔드 데이터 → 화면 표시용 데이터 변환
  const mapToFlightTableData = (item) => {
    const baseDate = new Date(item.departuredate ?? "1970-01-01");
    
    //const arrivalTime = item.arrivaltime ?? null;
    const rawDepartureTime = item.departuretime ?? null;
    const departureTime = extractTime(rawDepartureTime);

    const startTimeObj = calcTime(baseDate, departureTime, -6);
    const startTime = formatTime(startTimeObj);

    let endTime = "-";
    if (startTimeObj) {
      const endTimeObj = new Date(startTimeObj);
      endTimeObj.setHours(endTimeObj.getHours() + 2);
      endTime = formatTime(endTimeObj);
    }

    return {
      id: item.id ?? "-",
      flight: item.flightNumber ?? "-",
      airline: item.airline ?? "-",             // ✅ Wash 전용 항공사 구분
      destination: item.destination ?? "-",
      aircraft: item.acversion ?? "-",
      regNumber: item.ac_Reg ?? "-",            // ✅ 레그넘버
      departureDate: item.departuredate ?? "-",
      departureTime: extractTime(item.departuretime) ?? "-",
      startTime,
      prepDays: -1,
      endTime,
      bool_complete8: item.bool_complete8 ?? 0, // ✅ WashAndPack2 전용 완료 필드
      cart_meal : item.cart_meal ?? "-",
      cart_eq : item.cart_eq ?? "-",
      cart_glss : item.cart_glss ?? "-",
      ey_cart : item.ey_Cart ?? "-",
      cart_linnen : item.cart_linnen ?? "-",
      cart_st : item.cart_st ?? "-",
      comment: item.comment8 ?? "",
      workersign2: item.sign_wkr2 ?? "",       // ✅ 작업자 서명
      checkersign: item.sign_sprv ?? "", // ✅ 확인자 서명
      completeDate: item.completeDate ?? "-",
      completeTime: extractTime(item.completeTime) ?? "-",
    };
  };

  // ✅ 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://211.42.159.18:8080/api/members");
        const json = await res.json();
        setData(json.map(mapToFlightTableData));
      } catch (err) {
        console.error("❌ 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ 완료 체크 토글 → step=8 고정
 const toggleBoolComplete = async (id, step = 8, currentValue, latestComment = "", extraValues = {}) => {
  const newValue = currentValue === 1 ? 0 : 1;

  let uiCompleteDate = "-";
  let uiCompleteTime = "-";
  if (newValue === 1) {
    const now = new Date();
    uiCompleteDate = now.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
                        .replace(/\.\s*/g, "/").replace(/\/$/, "");
    uiCompleteTime = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  try {
    const bodyData = {
      value: newValue,
      comment: latestComment,
      sign_wkr2: extraValues.workersign2,
      sign_sprv: extraValues.checkersign,
      cart_meal: Number(extraValues.cart_meal) || 0,
      cart_eq: Number(extraValues.cart_eq) || 0,
      cart_glss: Number(extraValues.cart_glss) || 0,
      ey_cart: Number(extraValues.ey_cart) || 0,
      cart_linnen: Number(extraValues.cart_linnen) || 0,
      cart_st: Number(extraValues.cart_st) || 0,
    };

    const res = await fetch(`http://211.42.159.18:8080/api/members/${id}/complete/${step}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    if (!res.ok) {
      console.error("❌ API 응답 오류:", await res.text());
      return;
    }

    console.log(`✅ bool_complete${step} + 주석/카트/서명 업데이트 완료`);

    setData((prev) =>
      prev.map((m) =>
        Number(m.id) === Number(id)
          ? {
              ...m,
              [`bool_complete${step}`]: newValue,
              comment: latestComment,
              completeDate: uiCompleteDate,
              completeTime: uiCompleteTime,
              ...extraValues,
            }
          : m
      )
    );
  } catch (err) {
    console.error("❌ 네트워크 오류:", err);
  }
};
  if (loading) return <div>데이터 불러오는 중...</div>;

  return (
    <div>
      <h2 style={{ textAlign: "center", margin: "20px 0", fontSize: "24px" }}>
        Wash and Pack 2
      </h2>
      <FlightTable
        data={data}
        toggleBoolComplete={toggleBoolComplete}
        washOnly={true}   // ✅ Wash 전용 UI
        makeOnly={true}   // ✅ 추가 UI가 필요하면 유지
        extraFields={[{ key: "workersign2", label: "작업자 서명"  },  { key: "checkersign", label: "확인자 서명" }
          ]}
        // 작업자 서명
        // 확인자 서명
      />
    </div>
  );
};

export default WashAndPack1;
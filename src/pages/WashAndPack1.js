import React, { useEffect, useState } from "react";
import FlightTable from "../components/FlightTable";
import "./WashAndPack1.css";

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

const WashAndPack1 = () => {
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
      bool_complete7: item.bool_complete7 ?? 0, // ✅ WashAndPack1 전용 완료필드
      signworker1 : item.sign_wkr1 ?? "", // ✅ 작업자 서명
      comment: item.comment7 ?? "",
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

  // ✅ 완료 체크 토글 → step=7 고정
    const toggleBoolComplete = async (id, step = 7, currentValue, latestComment = "", extraValues = {}) => {
       const newValue = currentValue === 1 ? 0 : 1;

    // ✅ UI 업데이트용 완료일자/시간
    let uiCompleteDate = "-";
    let uiCompleteTime = "-";
    if (newValue === 1) {
      const now = new Date();
      uiCompleteDate = now
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\.\s*/g, "/")
        .replace(/\/$/, "");
      uiCompleteTime = now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    try {
    const bodyData = {
      value: newValue,
      comment: latestComment,            // ✅ 주석 전송
      sign_wkr1: extraValues.signworker1, // ✅ 작업자 서명 전송
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

    console.log(`✅ bool_complete${step} + 주석/서명 업데이트 완료`);

    setData((prev) =>
      prev.map((m) =>
        Number(m.id) === Number(id)
          ? {
              ...m,
              [`bool_complete${step}`]: newValue,
              comment: latestComment,
              signworker1: extraValues.workerSign,
              completeDate: uiCompleteDate,
              completeTime: uiCompleteTime,
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
    <div className="wash-and-pack-1-container">
      <h2 style={{ textAlign: "center", margin: "20px 0", fontSize: "24px" }}>
        Wash and Pack 1
      </h2>
      <FlightTable
        data={data}
        toggleBoolComplete={toggleBoolComplete}
        washOnly={true} // ✅ Wash 전용 UI 표시
        extraFields={[
          { key: "signworker1", label: "서명" },
        ]}
      />
    </div>
  );
};

export default WashAndPack1;
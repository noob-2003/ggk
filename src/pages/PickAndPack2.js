import React, { useEffect, useState } from "react";
import FlightTable from "../components/FlightTable";

// ✅ 안전한 시간 계산 함수
const calcTime = (baseDate, timeStr, offsetHours) => {
  if (!timeStr) return null;
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const dateObj = new Date(baseDate);
  dateObj.setHours(hours);
  dateObj.setMinutes(minutes);
  dateObj.setSeconds(seconds || 0);

  // offsetHours 만큼 더하거나 빼기
  dateObj.setHours(dateObj.getHours() + offsetHours);
  return dateObj;
};

// ✅ Date → HH:mm:ss 포맷
const formatTime = (dateObj) => {
  if (!dateObj) return "-";
  const h = String(dateObj.getHours()).padStart(2, "0");
  const m = String(dateObj.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const PickAndPack2 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 백엔드 데이터 → 화면 표시용 데이터 변환
  const mapToFlightTableData = (item) => {
    const baseDate = new Date(item.departuredate ?? "1970-01-01");
    const departureTime = item.departuretime ?? null; // ✅ 출발시간 사용

    // ✅ 작업시작 = 출발시간 - 6시간
    const startTimeObj = calcTime(baseDate, departureTime, -6);
    const startTime = formatTime(startTimeObj);

    // ✅ 작업종료 = 작업시작 + 2시간
    let endTime = "-";
    if (startTimeObj) {
      const endTimeObj = new Date(startTimeObj);
      endTimeObj.setHours(endTimeObj.getHours() + 2);
      endTime = formatTime(endTimeObj);
    }

    return {
      id: item.id ?? "-",
      flight: item.flightNumber ?? "-",
      destination: item.destination ?? "-",
      aircraft: item.acversion ?? "-",
      departureDate: item.departuredate ?? "-",
      departureTime: departureTime ?? "-",
      startTime,           // ✅ 출발시간 -6h
      prepDays: -1,
      endTime,             // ✅ 작업시작 +2h
      bool_complete6: item.bool_complete6 ?? 0, // ✅ PickAndPack2 전용
      completeDate: item.completeDate ?? "-",
      completeTime: item.completeTime ?? "-",
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

  // ✅ 완료 체크 토글 → step=6 고정
  const toggleBoolComplete = async (id, step = 6, currentValue) => {
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
      const res = await fetch(
        `http://211.42.159.18:8080/api/members/${id}/complete/${step}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: newValue }),
        }
      );

      if (!res.ok) {
        console.error("❌ API 응답 오류:", await res.text());
        return;
      }

      console.log(`✅ bool_complete${step} 업데이트 성공`);

      setData((prev) =>
        prev.map((m) =>
          Number(m.id) === Number(id)
            ? {
                ...m,
                [`bool_complete${step}`]: newValue,
                completeDate: uiCompleteDate,
                completeTime: uiCompleteTime,
              }
            : m
        )
      );
    } catch (err) {
      console.error("❌ 네트워크/로직 오류:", err);
    }
  };

  if (loading) return <div>데이터 불러오는 중...</div>;

  return (
    <div>
      <h2 style={{ textAlign: "center", margin: "20px 0", fontSize: "24px" }}>
        Pick and Pack 2
      </h2>
      <FlightTable
        data={data}
        toggleBoolComplete={toggleBoolComplete}
        hideNote={true}
      />
    </div>
  );
};

export default PickAndPack2;
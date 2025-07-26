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

  const PickAndPack1 = () => {
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

      //const rawArrivalTime = item.arrivalTime ?? null;
      //const arrivalTime = extractTime(rawArrivalTime);
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
        destination: item.destination ?? "-",
        aircraft: item.acversion ?? "-",
        departureDate: item.departuredate ?? "-",
        departureTime: extractTime(item.departureTime) ?? "-",
        startTime,
        prepDays: -1,
        endTime,
        bool_complete5: item.bool_complete5 ?? 0, // ✅ PickAndPack1은 bool_complete5 고정
        completeDate: item.completeDate ?? "-",
        completeTime: extractTime(item.completeTime) ?? "-",
      };
    };

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

    // ✅ 완료 체크 토글 → step=5 고정
    const toggleBoolComplete = async (id, step = 5, currentValue) => {
      const newValue = currentValue === 1 ? 0 : 1;

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

        console.log(`✅ bool_complete${step} 업데이트 성공 (id=${id}, newValue=${newValue})`);

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
          Pick and Pack 1
        </h2>
        <FlightTable
          data={data}
          toggleBoolComplete={toggleBoolComplete}
          hideNote={true}
          // ✅ mode 필요 없음 (페이지별 고정)
        />
      </div>
    );
  };

export default PickAndPack1;
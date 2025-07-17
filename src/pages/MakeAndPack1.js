import React, { useEffect, useState } from "react";
import FlightTable from "../components/FlightTable";

// 시간 계산
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

// Date → HH:mm
const formatTime = (dateObj) => {
  if (!dateObj) return "-";
  const h = String(dateObj.getHours()).padStart(2, "0");
  const m = String(dateObj.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// DB → FlightTable 매핑
const mapToFlightTableData = (item) => {
  const baseDate = new Date(item.departuredate ?? "1970-01-01");
  const arrivalTime = item.arrivaltime ?? null;

  // 작업 시작/종료 계산
  const startTimeObj = calcTime(baseDate, arrivalTime, -8);
  const startTime = formatTime(startTimeObj);

  let endTime = "-";
  if (startTimeObj) {
    const endTimeObj = new Date(startTimeObj);
    endTimeObj.setHours(endTimeObj.getHours() + 2);
    endTime = formatTime(endTimeObj);
  }

  // 완료 여부 (1~4 중 하나라도 1이면 완료)
  const isCompleted =
    Number(item.bool_complete1) === 1 ||
    Number(item.bool_complete2) === 1 ||
    Number(item.bool_complete3) === 1 ||
    Number(item.bool_complete4) === 1;

  return {
    id: item.id ?? "-",
    flight: item.flightNumber ?? "-",         // 편명
    destination: item.destination ?? "-",     // 목적지
    aircraft: item.acversion ?? "-",          // 기종
    departureDate: item.departuredate ?? "-", // 출발날짜
    departureTime: arrivalTime ?? "-",        // 출발시간
    startTime: startTime,                     // 출발 -8시간
    prepDays: -1,                             // 준비시간 고정
    endTime: endTime,                         // 작업시작 +2시간
    completed: isCompleted ? "Y" : "N",       // 하나라도 1이면 Y
    note: "",
    completeDate: "",
    completeTime: ""
  };
};

const MakeAndPack1 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // API호출 -> 데이터 받아오기
    const fetchData = async () => {
      try {
        const res = await fetch("http://211.42.159.18:8080/api/members");
        const json = await res.json();

        console.log("API 응답:", json);

        const mapped = json.map((item) => mapToFlightTableData(item));

        console.log("변환된 데이터:", mapped);

        setData(mapped);
      } catch (err) {
        console.error("❌ 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>데이터 불러오는 중...</div>;

  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: "20px", marginBottom: "30px", fontSize: "24px" }}>
        Make and Pack 1
      </h2>
      <FlightTable data={data} />
    </div>
  );
};

export default MakeAndPack1;
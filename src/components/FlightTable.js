import React, { useState } from "react";
import "./FlightTable.css";

const cellMeta = {
  flight: "excel",
  destination: "excel",
  aircraft: "excel",
  departureDate: "system",
  departureTime: "system",
  startTime: "auto",
  prepDays: "auto",
  endTime: "auto",
  completed: "manual",
  note: "manual",
  completeDate: "system",
  completeTime: "system",
};

function formatTimeHHMM(timeStr) {
if (!timeStr) return "-";
try {
const [hour, minute] = timeStr.split(":");
const h = hour.padStart(2, "0");
const m = minute.padStart(2, "0");
return `${h}:${m}`;
} catch {
return timeStr;
} }

const renderCell = (key, value) => {
  const source = cellMeta[key];

  if (source === "system") return <span>{value}</span>;
  if (source === "auto") return <em>{value}</em>;
  if (source === "excel") return <strong>{value}</strong>;
  return <input type="text" defaultValue={value} />;
};

const CompleteToggleButton = ({ flight, toggleBoolComplete }) => {
  // ✅ flight 객체 내 완료 필드 자동 탐색
  const completeField = Object.keys(flight).find((k) => k.startsWith("bool_complete"));
  const isCompleted = flight[completeField] === 1;
  const currentValue = flight[completeField] ?? 0;

  const handleToggle = () => {
    toggleBoolComplete(flight.id, undefined, currentValue);
  };
  return <input type="checkbox" checked={isCompleted} onChange={handleToggle} />;
};

const FlightTable = ({ data, toggleBoolComplete, washOnly = false, makeOnly = false }) => {
  const [flightFilter, setFlightFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [completedFilter, setCompletedFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  const uniqueFlights = [...new Set(data.map((f) => f.flight))];
  const uniqueDestinations = [...new Set(data.map((f) => f.destination))];
  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const filteredData = useMemo(
    () =>
      data.filter((f) => {
        const matchFlight = flightFilter ? f.flight === flightFilter : true;
        const matchDest = destinationFilter ? f.destination === destinationFilter : true;

        // ✅ flight 내 완료 필드 자동 감지
        const completeField = Object.keys(f).find((k) => k.startsWith("bool_complete"));
        const completedValue = f[completeField] ?? 0;
        const isCompleted = completedValue === 1;
        const matchCompleted = !completedFilter
          ? true
          : completedFilter === "Y"
          ? isCompleted
          : !isCompleted;

        const depDate = f.departureDate?.slice(0, 10) ?? "";
        const targetDate = dateFilter === "today" ? todayStr : tomorrowStr;
        const matchDate = dateFilter === "all" ? true : depDate === targetDate;

        return matchFlight && matchDest && matchCompleted && matchDate;
      }),
    [data, flightFilter, destinationFilter, completedFilter, dateFilter, todayStr, tomorrowStr]
  );

  return (
    <div className="flight-tablecontainer">
      <div className="filter-controls">
        <label>
          비행편명 : 
          <select
            value={flightFilter}
            onChange={(e) => setFlightFilter(e.target.value)}
          >
            <option value="">전체</option>
            {uniqueFlights.map((flight) => (
              <option key={flight} value={flight}>
                {flight}
              </option>
            ))}
          </select>
        </label>

        <label>
          목적지 : 
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
          >
            <option value="">전체</option>
            {uniqueDestinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </label>

        <label>
          완료 여부 : 
          <select
            value={completedFilter}
            onChange={(e) => setCompletedFilter(e.target.value)}
          >
            <option value="">전체</option>
            <option value="Y">✅ 완료</option>
            <option value="N">❌ 미완료</option>
          </select>
        </label>

        <label>
          날짜 : 
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="today">오늘</option>
            <option value="tomorrow">내일</option>
            <option value="all">전체</option>
          </select>
        </label>
      </div>

      <div className="table-wrapper">
        <table className="flight-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>비행편명</th>
              {washOnly && <th>항공사구분</th>}
              <th>목적지</th>
              <th>기종</th>
              {washOnly && <th>레그넘버</th>}
              <th className="center-align">출발날짜</th>
              <th className="center-align">출발시간</th>
              <th className="center-align">작업시작</th>
              <th className="center-align">준비시간</th>
              <th className="center-align">작업종료</th>
              {makeOnly && <th>카트 MEAL</th>}
              {makeOnly && <th>카트 EQ</th>}
              {makeOnly && <th>카트 GLSS</th>}
              {makeOnly && <th>카트 EY</th>}
              {makeOnly && <th>카트 LINNEN</th>}
              {makeOnly && <th>카트 S/T SET</th>}
              <th className="center-align">완료</th>
              <th>주석</th>
              <th>완료일자</th>
              <th>완료시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{renderCell("flight", f.flight)}</td>
                {washOnly && <td>{f.flight?.startsWith("OZ") ? "OZ" : "OAL"}</td>}
                <td>{renderCell("destination", f.destination)}</td>
                <td>{renderCell("aircraft", f.aircraft)}</td>
                {washOnly && <td>{f.regNumber}</td>}
                <td>{renderCell("departureDate", f.departureDate)}</td>
                <td>{renderCell("departureTime", f.departureTime)}</td>
                <td>{renderCell("startTime", f.startTime)}</td>
                <td>{f.prepDays ?? -1}</td>
                <td>{renderCell("endTime", f.endTime)}</td>

                {makeOnly && <td>{f.cart_meal}</td>}
                {makeOnly && <td>{f.cart_eq}</td>}
                {makeOnly && <td>{f.cart_glss}</td>}
                {makeOnly && <td>{f.cart_ey}</td>}
                {makeOnly && <td>{f.cart_linnen}</td>}
                {makeOnly && <td>{f.cart_stset}</td>}

                <td className="center-align">
                  <CompleteToggleButton flight={f} toggleBoolComplete={toggleBoolComplete} />
                </td>

                <td>{renderCell("note", f.note)}</td>
                <td>{f.completeDate ?? "-"}</td>
                <td>{formatTimeHHMM(f.completeTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightTable;
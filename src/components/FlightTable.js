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

const renderCell = (key, value) => {
  const source = cellMeta[key];

  if (source === "system") return <span>{value}</span>;
  if (source === "auto") return <em>{value}</em>;
  if (source === "excel") return <strong>{value}</strong>;
  return <input type="text" defaultValue={value} />;
};

const FlightTable = ({ data, toggleBoolComplete, washOnly = false }) => {
  const [flightFilter, setFlightFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [completedFilter, setCompletedFilter] = useState("");

  const uniqueFlights = [...new Set(data.map((f) => f.flight))];
  const uniqueDestinations = [...new Set(data.map((f) => f.destination))];

  const filteredData = data.filter(
    (f) =>
      (flightFilter ? f.flight === flightFilter : true) &&
      (destinationFilter ? f.destination === destinationFilter : true) &&
      (completedFilter
        ? f.bool_complete1 === 1
          ? "Y" === completedFilter
          : "N" === completedFilter
        : true)
  );

  return (
    <div className="flight-tablecontainer">
      <div className="filter-controls">
        <label>
          비행편명:
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
          목적지:
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
          완료 여부:
          <select
            value={completedFilter}
            onChange={(e) => setCompletedFilter(e.target.value)}
          >
            <option value="">전체</option>
            <option value="Y">✅ 완료</option>
            <option value="N">❌ 미완료</option>
          </select>
        </label>
      </div>

      <div className="table-wrapper">
        <table className="flight-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>비행편명</th>
              <th>목적지</th>
              <th>기종</th>
              {washOnly && <th>레그넘버</th>}
              <th className="center-align">출발날짜</th>
              <th className="center-align">출발시간</th>
              <th className="center-align">작업시작</th>
              <th className="center-align">준비시간</th>
              <th className="center-align">작업종료</th>
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
                <td>{renderCell("destination", f.destination)}</td>
                <td>{renderCell("aircraft", f.aircraft)}</td>
                {washOnly && ( <td data-label="레그넘버" className="center-align"> {f.regNumber} </td> )} 
                <td>{renderCell("departureDate", f.departureDate)}</td>
                <td className="center-align">
                  {renderCell("departureTime", f.departureTime)}
                </td>
                <td className="center-align">
                  {renderCell("startTime", f.startTime)}
                </td>
                <td className="center-align">{f.prepDays ?? -1}</td>
                <td className="center-align">{renderCell("endTime", f.endTime)}</td>

                {/* ✅ bool_complete1 연동 체크박스 */}
                <td className="center-align">
                  <input
                    type="checkbox"
                    checked={f.bool_complete1 === 1}
                    onChange={() =>
                      toggleBoolComplete(f.id, 1, f.bool_complete1)
                    }
                  />
                </td>

                <td>{renderCell("note", f.note)}</td>
                {/* ✅ 완료일자/시간 출력 */}
                <td>{f.completeDate ?? "-"}</td>
                <td>{f.completeTime ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightTable;
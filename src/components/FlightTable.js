import React, { useState, useMemo } from "react";
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
  }
}

// ✅ 기존 renderCell 유지
const renderCell = (key, value) => {
  const source = cellMeta[key];

  if (source === "system") return <span>{value}</span>;
  if (source === "auto") return <em>{value}</em>;
  if (source === "excel") return <strong>{value}</strong>;
  return <input type="text" defaultValue={value} />;
};

// ✅ 완료 버튼 (comment와 extraFields까지 넘길 수 있게 변경)
const CompleteToggleButton = ({ flight, toggleBoolComplete, latestComment, extraValues }) => {
  const completeField = Object.keys(flight).find((k) => k.startsWith("bool_complete"));
  const isCompleted = flight[completeField] === 1;
  const currentValue = flight[completeField] ?? 0;

  const handleToggle = () => {
    toggleBoolComplete(flight.id, undefined, currentValue, latestComment, extraValues);
  };

  return <input type="checkbox" checked={isCompleted} onChange={handleToggle} />;
};

// ✅ 주석/서명 입력칸 (완료되면 readOnly)
const EditableNoteCell = ({ value, onChange, disabled }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={disabled}
      style={{
        backgroundColor: disabled ? "#f3f3f3" : "white",
        color: disabled ? "#999" : "black",
        border: disabled ? "1px solid #ccc" : "1px solid #666",
      }}
    />
  );
};

const FlightTable = ({
  data,
  toggleBoolComplete,
  washOnly = false,
  makeOnly = false,
  hideNote = false,        // ✅ PickAndPack에서 주석 숨김용
  extraFields = []         // ✅ WashAndPack 전용 추가필드 [{key:"workerSign", label:"작업자 서명"}, ...]
}) => {
  const [flightFilter, setFlightFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [completedFilter, setCompletedFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  // ✅ 주석/추가필드 상태
  const [comments, setComments] = useState({});
  const handleCommentChange = (id, newValue) => {
    setComments((prev) => ({ ...prev, [id]: newValue }));
  };

  const uniqueFlights = useMemo(() => [...new Set(data.map((f) => f.flight))], [data]);
  const uniqueDestinations = useMemo(() => [...new Set(data.map((f) => f.destination))], [data]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const filteredData = useMemo(
    () =>
      data.filter((f) => {
        const matchFlight = flightFilter ? f.flight === flightFilter : true;
        const matchDest = destinationFilter ? f.destination === destinationFilter : true;

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
      {/* ✅ 필터 영역 */}
      <div className="filter-controls">
        <label>
          비행편명 :
          <select value={flightFilter} onChange={(e) => setFlightFilter(e.target.value)}>
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
          <select value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)}>
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
          <select value={completedFilter} onChange={(e) => setCompletedFilter(e.target.value)}>
            <option value="">전체</option>
            <option value="Y">✅ 완료</option>
            <option value="N">❌ 미완료</option>
          </select>
        </label>

        <label>
          날짜 :
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="today">오늘</option>
            <option value="tomorrow">내일</option>
            <option value="all">전체</option>
          </select>
        </label>
      </div>

      {/* ✅ 테이블 */}
      <div className="table-wrapper">
        <table className="flight-table">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-flight">비행편명</th>
              {washOnly && <th className="col-airline">항공사구분</th>}
              <th className="col-destination">목적지</th>
              <th className="col-aircraft">기종</th>
              {washOnly && <th className="col-reg">레그넘버</th>}
              <th className="col-departure-date">출발날짜</th>
              <th className="col-departure-time">출발시간</th>
              <th className="col-start-time">작업시작</th>
              <th className="col-prep-time">준비시간</th>
              <th className="col-end-time">작업종료</th>
              {makeOnly && <th className="col-cart-meal">카트 MEAL</th>}
              {makeOnly && <th className="col-cart-eq">카트 EQ</th>}
              {makeOnly && <th className="col-cart-glss">카트 GLSS</th>}
              {makeOnly && <th className="col-cart-ey">카트 EY</th>}
              {makeOnly && <th className="col-cart-linnen">카트 LINNEN</th>}
              {makeOnly && <th className="col-cart-set">카트 S/T SET</th>}
              <th className="col-completed">완료</th>
              {!hideNote && <th className="col-note">주석</th>}
              {/* ✅ extraFields 헤더 */}
              {extraFields.map((field) => (
                <th key={field.key} className={`col-${field.key}`}>{field.label}</th>
              ))}
              <th className="col-completed-date">완료일자</th>
              <th className="col-completed-time">완료시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((f) => {
              const completeField = Object.keys(f).find((k) => k.startsWith("bool_complete"));
              const isCompleted = f[completeField] === 1;
              const currentComment = comments[f.id] ?? f.comment ?? "";

              // ✅ extraFields 값 초기화
              const extraValues = {};
              extraFields.forEach((field) => {
                extraValues[field.key] =
                  comments[`${f.id}_${field.key}`] ?? f[field.key] ?? "";
              });

              return (
                <tr key={f.id}>
                  <td className="col-id" data-label="ID">{f.id}</td>
                  <td className="col-flight" data-label="비행편명">{renderCell("flight", f.flight)}</td>
                  {washOnly && (
                    <td className="col-airline" data-label="항공사구분">
                      {f.flight?.startsWith("OZ") ? "OZ" : "OAL"}
                    </td>
                  )}
                  <td className="col-destination" data-label="목적지">{renderCell("destination", f.destination)}</td>
                  <td className="col-aircraft" data-label="기종">{renderCell("aircraft", f.aircraft)}</td>
                  {washOnly && <td className="col-reg" data-label="레그넘버">{f.regNumber}</td>}
                  <td className="col-departure-date" data-label="출발날짜">{renderCell("departureDate", f.departureDate)}</td>
                  <td className="col-departure-time" data-label="출발시간">{renderCell("departureTime", f.departureTime)}</td>
                  <td className="col-start-time" data-label="작업시작">{renderCell("startTime", f.startTime)}</td>
                  <td className="col-prep-time" data-label="준비시간">{f.prepDays ?? -1}</td>
                  <td className="col-end-time" data-label="작업종료">{renderCell("endTime", f.endTime)}</td>

                  {makeOnly && <td className="col-cart-meal" data-label="카트 MEAL">{f.cart_meal}</td>}
                  {makeOnly && <td className="col-cart-eq" data-label="카트 EQ">{f.cart_eq}</td>}
                  {makeOnly && <td className="col-cart-glss" data-label="카트 GLSS">{f.cart_glss}</td>}
                  {makeOnly && <td className="col-cart-ey" data-label="카트 EY">{f.cart_ey}</td>}
                  {makeOnly && <td className="col-cart-linnen" data-label="카트 LINNEN">{f.cart_linnen}</td>}
                  {makeOnly && <td className="col-cart-set" data-label="카트 S/T SET">{f.cart_stset}</td>}

                  <td className="col-completed" data-label="완료">
                    <CompleteToggleButton
                      flight={f}
                      toggleBoolComplete={toggleBoolComplete}
                      latestComment={currentComment}
                      extraValues={extraValues} // ✅ 추가필드 값 전달
                    />
                  </td>

                  {!hideNote && (
                    <td className="col-note" data-label="주석">
                      <EditableNoteCell
                        value={currentComment}
                        onChange={(val) => handleCommentChange(f.id, val)}
                        disabled={isCompleted}
                      />
                    </td>
                  )}

                  {/* ✅ extraFields 컬럼 */}
                  {extraFields.map((field) => (
                    <td key={field.key} className={`col-${field.key}`}>
                      <EditableNoteCell
                        value={extraValues[field.key]}
                        onChange={(val) =>
                          handleCommentChange(`${f.id}_${field.key}`, val)
                        }
                        disabled={isCompleted}
                      />
                    </td>
                  ))}

                  <td className="col-completed-date" data-label="완료일자">{f.completeDate ?? "-"}</td>
                  <td className="col-completed-time" data-label="완료시간">{formatTimeHHMM(f.completeTime)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightTable;
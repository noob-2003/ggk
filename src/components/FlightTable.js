import React, { useState } from 'react';
import './FlightTable.css';

// 셀 정의 
const cellMeta = {
  flight: 'excel',
  destination: 'excel',
  aircraft: 'excel',
  departureDate: 'system',
  departureTime: 'system',
  startTime: 'auto',
  prepDays: 'auto',
  endTime: 'auto',
  completed: 'manual',
  note: 'manual',
  completeDate: 'system',
  completeTime: 'system',
};

// 셀 렌더링 방식
const renderCell = (key, value) => {
  const source = cellMeta[key];

  if (source === 'system') return <span>{value}</span>;
  if (source === 'auto') return <em>{value}</em>;
  if (source === 'excel') return <strong>{value}</strong>;
  return <input type="text" defaultValue={value} />;
};

const FlightTable = ({ data, washOnly = false }) => {
  // ✅ 비행편/목적지/완료 여부 필터링 상태
  const [flightFilter, setFlightFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');

  // ✅ 필터 메뉴에 쓸 고유 flight/destination 리스트
  const uniqueFlights = [...new Set(data.map(f => f.flight))];
  const uniqueDestinations = [...new Set(data.map(f => f.destination))];

  // ✅ 초기 완료 상태/타임스탬프 세팅 (프론트 전용)
  const [completionTimestamps, setCompletionTimestamps] = useState(() =>
    data.reduce((acc, item) => {
      if (item.completed === 'Y') {
        acc[item.id] = {
          date: item.completeDate,
          time: item.completeTime,
        };
      }
      return acc;
    }, {})
  );

  const [completionStatus, setCompletionStatus] = useState(() =>
    data.reduce((acc, item) => {
      acc[item.id] = item.completed === 'Y';
      return acc;
    }, {})
  );

  // ✅ 필터링 로직 (completionStatus 기반)
  const filteredData = data.filter(f =>
    (flightFilter ? f.flight === flightFilter : true) &&
    (destinationFilter ? f.destination === destinationFilter : true) &&
    (completedFilter
      ? (completionStatus[f.id] ? 'Y' : 'N') === completedFilter
      : true)
  );

  // ✅ 프론트 전용 완료 상태 토글 함수
  const handleCheckboxChange = (id) => {
    const nowChecked = !completionStatus[id];

    setCompletionStatus((prev) => ({
      ...prev,
      [id]: nowChecked,
    }));

    setCompletionTimestamps((prev) => {
      if (nowChecked) {
        const now = new Date();
        const rawDate = now.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

        const date = rawDate
          .replace(/\./g, '/')
          .replace(/\s/g, '')
          .replace(/\/$/, '');

        const time = now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        return {
          ...prev,
          [id]: { date, time },
        };
      } else {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
    });
  };

  return (
    <div className="flight-tablecontainer">
      {/* ✅ 필터 메뉴 */}
      <div className="filter-controls">
        <label>
          비행편명:
          <select value={flightFilter} onChange={(e) => setFlightFilter(e.target.value)}>
            <option value="">전체</option>
            {uniqueFlights.map(flight => (
              <option key={flight} value={flight}>{flight}</option>
            ))}
          </select>
        </label>

        <label>
          목적지:
          <select value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)}>
            <option value="">전체</option>
            {uniqueDestinations.map(dest => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
        </label>

        <label>
          완료 여부:
          <select value={completedFilter} onChange={(e) => setCompletedFilter(e.target.value)}>
            <option value="">전체</option>
            <option value="Y">✅ 완료</option>
            <option value="N">❌ 미완료</option>
          </select>
        </label>
      </div>

      {/* ✅ 테이블 */}
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
              <th className="center-align">완료일자</th>
              <th className="center-align">완료시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((f) => (
              <tr key={f.id}>
                <td data-label="ID">{f.id}</td>
                <td data-label="비행편명">{renderCell('flight', f.flight)}</td>
                <td data-label="목적지">{renderCell('destination', f.destination)}</td>
                <td data-label="기종">{renderCell('aircraft', f.aircraft)}</td>
                {washOnly && ( <td data-label="레그넘버" className="center-align"> {f.legNumber ?? '-'} </td> )}
                <td data-label="출발날짜" className="nowrap-cell">{renderCell('departureDate', f.departureDate)}</td>
                <td data-label="출발시간" className="center-align">{renderCell('departureTime', f.departureTime)}</td>
                <td data-label="작업시작" className="center-align">{renderCell('startTime', f.startTime)}</td>
                <td data-label="준비시간" className="center-align">{f.prepDays ?? -1}</td>
                <td data-label="작업종료" className="center-align">{renderCell('endTime', f.endTime)}</td>

                {/* ✅ 원래 프론트 전용 체크박스 */}
                <td data-label="완료" className="center-align">
                  <input
                    type="checkbox"
                    checked={completionStatus[f.id] || false}
                    onChange={() => handleCheckboxChange(f.id)}
                  />
                </td>

                <td data-label="주석">{renderCell('note', f.note)}</td>

                {/* ✅ 완료일자/시간은 프론트 전용 상태 기반 */}
                <td data-label="완료일자" className="center-align">
                  {completionStatus[f.id] && completionTimestamps[f.id]?.date}
                </td>
                <td data-label="완료시간" className="center-align">
                  {completionStatus[f.id] && completionTimestamps[f.id]?.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightTable;
import { useState } from 'react';
import './DashboardTable.css';

const DashboardTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dateFilter, setDateFilter] = useState("today");

  // ✅ 작업 키 정의
  const completeKeys = [
    'bool_complete1',
    'bool_complete2',
    'bool_complete3',
    'bool_complete5',
    'bool_complete6',
    'bool_complete7',
    'bool_complete8'
  ];

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

  const extractDate = (dateStr) => {
    if (!dateStr) return "-";

    // ISO 형식 1900-01-01T09:00:00
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
      
    // 이미 날짜 형식
    if (dateStr.includes('-')) {
      return dateStr.slice(0, 10);
    }
      
    return dateStr;
  };

  const getLocalDateStr = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = getLocalDateStr(today);
  const tomorrowStr = getLocalDateStr(tomorrow);

  // ✅ 사용자에게 보여줄 라벨 매핑
  const completeKeyLabels = {
    bool_complete1: "MNP1",
    bool_complete2: "MNP2",
    bool_complete3: "MNP3",
    bool_complete5: "PNP1",
    bool_complete6: "PNP2",
    bool_complete7: "WNP1",
    bool_complete8: "WNP2",
  };

  // ✅ 전체 완료 상태 계산 → "완료" / "미완료"
  const getOverrallStatus = (member) => {
    const allDone = completeKeys.every(k => Number(member?.[k] ?? 0) === 1);
    return allDone ? '완료' : '미완료';
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ✅ 필터링 + 정렬
  const filteredData = data
    .filter((item) => {
    const flightMatch = (item.flightNumber ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const status = getOverrallStatus(item);
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === '완료' && status === '완료') ||
      (statusFilter === '미완료' && status === '미완료');

    const depDate = item.departuredate?.slice(0, 10) ?? "";
    const matchDate =
      dateFilter === "all"
        ? true
        : dateFilter === "today"
        ? depDate === todayStr
        : depDate === tomorrowStr;

    return flightMatch && statusMatch && matchDate;
  })
  .sort((a, b) => {
    if (!sortConfig.key) return 0;
    const A = (a[sortConfig.key] ?? '').toString();
    const B = (b[sortConfig.key] ?? '').toString();
    return sortConfig.direction === 'asc'
      ? A.localeCompare(B)
      : B.localeCompare(A);
  });

  return (
    <div className="dashboard-container">
      <h2>상세 대시보드</h2>

      {/* ✅ 검색 + 상태 필터 */}
      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="비행편명 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="완료">완료</option>
          <option value="미완료">미완료</option>
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="today">오늘</option>
          <option value="tomorrow">내일</option>
        </select>
      </div>

      {/* ✅ 테이블 */}
      <div className="table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th onClick={() => handleSort('flightNumber')}>비행편명</th>
              <th onClick={() => handleSort('destination')}>목적지</th>
              <th onClick={() => handleSort('acversion')}>기종</th>

              {completeKeys.map((key) => (
                <th key={key}>{completeKeyLabels[key] ?? key}</th>
              ))}

              <th>완료 여부</th>
              <th>출발일</th>
              <th>출발시간</th>
              <th>업로드일</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => {
              const overallStatus = getOverrallStatus(item); // ✅ 수정
              const statusClass =
                overallStatus === '완료' ? 'cell-complete' : 'cell-incomplete';

              return (
                <tr key={idx}>
                  <td data-label="ID">{item.id}</td>
                  <td data-label="비행편명">{item.flightNumber}</td>
                  <td data-label="목적지">{item.destination}</td>
                  <td data-label="기종">{item.acversion}</td>

                  {/* ✅ bool_complete1~8 값 표시 */}
                  {completeKeys.map((key) => (
                    <td data-label={completeKeyLabels[key] ?? key} key={key}>
                      {item?.[key] ?? 0}
                    </td>
                  ))}

                  {/* ✅ 완료/미완료 표시 */}
                  <td data-label="완료 여부" className={statusClass}>
                    {overallStatus}
                  </td>

                  <td data-label="출발일">{item.departuredate}</td>
                  <td data-label="출발시간">{extractTime(item.departuretime)}</td>
                  <td data-label="업로드일">{extractDate(item.uploadDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardTable;
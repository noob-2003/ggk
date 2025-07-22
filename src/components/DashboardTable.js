import React, { useState } from 'react';
import './DashboardTable.css';

const DashboardTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
      const status = getOverrallStatus(item); // ✅ item.tasks 제거
      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === '완료' && status === '완료') ||
        (statusFilter === '미완료' && status === '미완료');

      return flightMatch && statusMatch;
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
                  <td data-label="출발시간">{item.departuretime}</td>
                  <td data-label="업로드일">{item.uploadDate}</td>
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
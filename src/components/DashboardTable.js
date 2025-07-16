import React, { useState } from 'react';
import './DashboardTable.css';

const DashboardTable = ({ data }) => {
  // 비행편명 검색용
  const [searchTerm, setSearchTerm] = useState('');
  // 완료/미완료/전체 중 선택된 상태
  const [statusFilter, setStatusFilter] = useState('all');
  // 정렬할 항목과 방향
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 작업 키 정의
  const completeKeys = [
    'bool_complete1',
    'bool_complete2',
    'bool_complete3',
    'bool_complete4',
    'bool_complete5',
    'bool_complete6',
    'bool_complete7',
    'bool_complete8'
  ];

  // 완료 여부 계산
  const getOverrallStatus = (member) => {
    const allDone = completeKeys.every(k => Number(member?.[k] ?? 0) === 1);
    return allDone ? '완료' : '미완료';
  };

  // 정렬 핸들러
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // 필터 + 정렬 처리
  const filteredData = data
    .filter((item) => { // 검색어와 상태 필터가 모두 맞는 데이터만 남김
      const flightMatch = (item.flightNumber ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const status = getOverrallStatus(item); // item.tasks 제거
      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === '완료' && status === '완료') ||
        (statusFilter === '미완료' && status === '미완료');

      return flightMatch && statusMatch;
    })
    .sort((a, b) => { // 클릭한 열 기준으로 정렬
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

      {/* 검색 + 상태 필터 */}
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

      {/* 테이블 */}
      <div className="table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th onClick={() => handleSort('flightNumber')}>비행편명</th>
              <th onClick={() => handleSort('destination')}>목적지</th>
              <th onClick={() => handleSort('acversion')}>기종</th>

              {completeKeys.map((key) => (
                <th key={key}>{key.toUpperCase()}</th>
              ))}

              <th>완료 여부</th>
              <th>출발일</th>
              <th>출발시간</th>
              <th>업로드일</th>
            </tr>
          </thead>
          
          <tbody>
            {filteredData.map((item, idx) => {
              const overallStatus = getOverrallStatus(item);
              const statusClass =
                overallStatus === '완료' ? 'cell-complete' : 'cell-incomplete';

              return (
                <tr key={idx}>
                  <td data-label="ID">{item.id}</td>
                  <td data-label="비행편명">{item.flightNumber}</td>
                  <td data-label="목적지">{item.destination}</td>
                  <td data-label="기종">{item.acversion}</td>

                  {/* bool_complete1~8 값 표시 */}
                  {completeKeys.map((key) => (
                    <td data-label={key.toUpperCase()} key={key}>
                      {item?.[key] ?? 0}
                    </td>
                  ))}

                  {/* 완료/미완료 표시 */}
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
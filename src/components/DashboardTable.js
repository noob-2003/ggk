import { useState } from 'react';
import './DashboardTable.css';

const DashboardTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const taskKeys = ['mnp1', 'mnp2', 'mnp3', 'mnp4', 'pnp1', 'pnp2', 'wnp1', 'wnp2'];

  const getOverrallStatus = (tasks) => {
    for (const k of taskKeys) {
      if (tasks[k] === 'N') return '미완료';
    }
    return '완료';
  };

  const filteredData = data.filter((item) => {
    const flightMatch = item.flight.toLowerCase().includes(searchTerm.toLowerCase());
    const overall = getOverrallStatus(item.tasks);
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === '완료' && overall === '완료') ||
      (statusFilter === '미완료' && overall === '미완료');

    return flightMatch && statusMatch;
  });

  // 작업 상태를 그룹으로 렌더링
  const renderTaskGroup = (tasks) => {
    return (
      <div className="task-group">
        {taskKeys.map((key) => {
          const status = tasks?.[key] ?? 'Y';
          const className = status === 'Y' ? 'task-item complete' : 'task-item incomplete';
          return (
            <span key={key} className={className}>
              {key.toUpperCase()}: {status}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h2>상세 대시보드</h2>

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

      <div className="table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>비행편명</th>
              <th>목적지</th>
              <th>기종</th>
              {taskKeys.map((key) => (
                <th key={key}>{key.toUpperCase()}</th>
              ))}
              <th>완료 여부</th>
              <th>지연시간</th>
              <th>출발일</th>
              <th>작업시작</th>
              <th>작업종료</th>
              <th>완료일</th>
              <th>완료시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => {
              const overallStatus = getOverrallStatus(item.tasks);
              const statusClass = overallStatus === '완료' ? 'cell-complete' : 'cell-incomplete';

              let delayClass = '';
              const delay = item.delayMinutes ?? 0;
              if (delay === 0) delayClass = 'delay-none';
              else if (delay <= 15) delayClass = 'delay-low';
              else if (delay <= 30) delayClass = 'delay-medium';
              else delayClass = 'delay-high';

              return (
                <tr key={idx}>
                  <td data-label="ID">{idx + 1}</td>
                  <td data-label="비행편명">{item.flight}</td>
                  <td data-label="목적지">{item.destination}</td>
                  <td data-label="기종">{item.aircraft}</td>
                  {taskKeys.map((key) => (
                    <td data-label={key.toUpperCase()} key={key}>{item.tasks?.[key] ?? 'Y'}</td>
                  ))}
                  <td data-label="완료 여부" className={statusClass}>{overallStatus}</td>
                  <td data-label="지연시간" className={delayClass}>{delay}분</td>
                  <td data-label="출발일">{item.departureDate}</td>
                  <td data-label="작업시간">{item.startTime}</td>
                  <td data-label="작업종료">{item.endTime}</td>
                  <td data-label="완료일">{item.completeDate}</td>
                  <td data-label="완료시간">{item.completeTime}</td>
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
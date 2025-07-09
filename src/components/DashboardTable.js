import { useState } from 'react';
import './DashboardTable.css';

const DashboardTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredData = data
    .filter((item) => {
      const matchesSearch =
        item.flight?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === '완료' && item.completed === 'Y') ||
        (statusFilter === '미완료' && item.completed === 'N');
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const valA = a[sortConfig.key] ?? '';
      const valB = b[sortConfig.key] ?? '';
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="dashboard-container">
      <h2>상세 대시보드</h2>

      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="비행편명 또는 제목 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="완료">완료</option>
          <option value="미완료">미완료</option>
        </select>
      </div>

      <table className="dashboard-table">
        <thead>
          <tr>
            {[
              'id',
              'title',
              'department',
              'formNumber',
              'flight',
              'destination',
              'aircraft',
              'completed',
              'delayMinutes',
              'departureDate',
              'startTime',
              'endTime',
              'completeDate',
              'completeTime',
            ].map((key) => (
              <th key={key} onClick={() => handleSort(key)}>
                {key === 'delayMinutes' ? '지연시간' : key}
                {sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => {
            const isCompleted = item.completed === 'Y';
            const delay = item.delayMinutes ?? 0;

            let delayClass = '';
            if (delay === 0) delayClass = 'delay-none';
            else if (delay <= 15) delayClass = 'delay-low';
            else if (delay <= 30) delayClass = 'delay-medium';
            else delayClass = 'delay-high';

            return (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.department}</td>
                <td>{item.formNumber}</td>
                <td>{item.flight}</td>
                <td>{item.destination}</td>
                <td>{item.aircraft}</td>
                <td className={isCompleted ? 'cell-complete' : 'cell-incomplete'}>
                  {isCompleted ? '완료' : '미완료'}
                </td>
                <td className={delayClass}>{delay}분</td>
                <td>{item.departureDate}</td>
                <td>{item.startTime}</td>
                <td>{item.endTime}</td>
                <td>{item.completeDate}</td>
                <td>{item.completeTime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable;
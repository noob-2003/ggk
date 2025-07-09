import React from 'react';
import DashboardTable from '../components/DashboardTable';
import { makeAndPack1Data } from './MakeAndPack1';
import { makeAndPack2Data } from './MakeAndPack2';
import { makeAndPack3Data } from './MakeAndPack3';
import { makeAndPack4Data } from './MakeAndPack4';
import { pickAndPack1Data } from './PickAndPack1';
import { pickAndPack2Data } from './PickAndPack2';
import { washAndPack1Data } from './WashAndPack1';
import { washAndPack2Data } from './WashAndPack2';

const DashboardPage = () => {
  const allDepartmentData = [
    ...makeAndPack1Data.map((item) => ({ ...item, department: 'MnP', formNumber: 1, title: 'MnP_1DailyChecker' })),
    ...makeAndPack2Data.map((item) => ({ ...item, department: 'MnP', formNumber: 2, title: 'MnP_2DailyChecker' })),
    ...makeAndPack3Data.map((item) => ({ ...item, department: 'MnP', formNumber: 3, title: 'MnP_3DailyChecker' })),
    ...makeAndPack4Data.map((item) => ({ ...item, department: 'MnP', formNumber: 4, title: 'MnP_4DailyChecker' })),
    ...pickAndPack1Data.map((item) => ({ ...item, department: 'PnP', formNumber: 1, title: 'PnP_1DailyChecker' })),
    ...pickAndPack2Data.map((item) => ({ ...item, department: 'PnP', formNumber: 2, title: 'PnP_2DailyChecker' })),
    ...washAndPack1Data.map((item) => ({ ...item, department: 'WnP', formNumber: 1, title: 'WnP_1DailyChecker' })),
    ...washAndPack2Data.map((item) => ({ ...item, department: 'WnP', formNumber: 2, title: 'WnP_2DailyChecker' })),
  ];
  const detailedData = allDepartmentData.map((item, index) => ({
    id: index + 1,
    title: item.title,
    department: item.department,
    formNumber: item.formNumber,
    flight: item.flight,
    destination: item.destination,
    aircraft: item.aircraft,
    completed: item.completed,
    delayMinutes: item.delayMinutes ?? 0,
    departureDate: item.departureDate,
    startTime: item.startTime,
    endTime: item.endTime,
    completeDate: item.completeDate,
    completeTime: item.completeTime,
  }));

  return (
    <div>
    <h1>대시보드 페이지</h1>
    <DashboardTable data={detailedData} />
  </div> 
  );
};

export default DashboardPage;
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
  const allFlights = Array.from(
    new Set([
    ...makeAndPack1Data,
    ...makeAndPack2Data,
    ...makeAndPack3Data,
    ...makeAndPack4Data,
    ...pickAndPack1Data,
    ...pickAndPack2Data,
    ...washAndPack1Data,
    ...washAndPack2Data,
  ].map((item) => item.flight))
  );
  
   const data = allFlights.map((flight, idx) => {
  const findStatus = (arr) => {
    const rec = arr.find((i) => i.flight === flight);
    return rec ? rec.completed : 'Y';
  };

  const tasks = {
    mnp1: findStatus(makeAndPack1Data),
    mnp2: findStatus(makeAndPack2Data),
    mnp3: findStatus(makeAndPack3Data),
    mnp4: findStatus(makeAndPack4Data),
    pnp1: findStatus(pickAndPack1Data),
    pnp2: findStatus(pickAndPack2Data),
    wnp1: findStatus(washAndPack1Data),
    wnp2: findStatus(washAndPack2Data),
  };

  const sample =
    makeAndPack1Data.find((i) => i.flight === flight) ||
    pickAndPack1Data.find((i) => i.flight === flight) ||
    washAndPack1Data.find((i) => i.flight === flight) ||
    {};
   
    return {
      id: idx + 1,
      department: sample.department || '',
      formNumber: sample.formNumber || '',
      flight,
      destination: sample.destination || '',
      aircraft: sample.aircraft || '',
      departureDate: sample.departureDate || '',
      startTime: sample.startTime || '',
      endTime: sample.endTime || '',
      completeDate: sample.completeDate || '',
      completeTime: sample.completeTime || '',
      delayMinutes: sample.delayMinutes || 0,
      tasks,
    };
  });

  return (
    <div>
    <h1>대시보드 페이지</h1>
    <DashboardTable data={data} />
  </div> 
  );
};

export default DashboardPage;
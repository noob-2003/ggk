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
  // 1) 모든 비행편명 집합 만들기

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
  // 2) 비행편별로 tasks 객체 구성
   const data = allFlights.map((flight, idx) => {
    // helper: 해당 배열에서 flight 값을 찾아 completed 반환
    const findStatus = (arr) => {
      const rec = arr.find((i) => i.flight === flight);
      return rec ? rec.completed : 'Y'; // 없으면 Y 처리
    };

  
    const sample =
      makeAndPack1Data.find((i) => i.flight === flight) ||
      pickAndPack1Data.find((i) => i.flight === flight) ||
      washAndPack1Data.find((i) => i.flight === flight) ||
      {}; 

      // tasks 키 순서: mnp1~4, pnp1~2, wnp1~2
    const tasks = {
      bool_complete1 : findStatus(makeAndPack1Data) === 'Y' ? 1 : 0,
      bool_complete2 : findStatus(makeAndPack2Data) === 'Y' ? 1 : 0,
      bool_complete3 : findStatus(makeAndPack3Data) === 'Y' ? 1 : 0,
      bool_complete4 : findStatus(makeAndPack4Data) === 'Y' ? 1 : 0,
      bool_complete5 : findStatus(pickAndPack1Data) === 'Y' ? 1 : 0,
      bool_complete6 : findStatus(pickAndPack2Data) === 'Y' ? 1 : 0,
      bool_complete7 : findStatus(washAndPack1Data) === 'Y' ? 1 : 0,
      bool_complete8 : findStatus(washAndPack2Data) === 'Y' ? 1 : 0,
    }; 
      
    // 기본 정보는 첫 번째 발견된 레코드에서 가져오기
   
     return {
      id: idx + 1,
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
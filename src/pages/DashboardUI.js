import React, { useState, useEffect, useMemo } from "react";
import "./DashboardUI.css";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";

const COLORS = ["#4caf50", "#f44336"];

const countCompletedFlights = (flights, requiredKeys) => {
  let completedFlightsCount = 0;
  flights.forEach(flight => {
    const allStepsCompleted = requiredKeys.every(key => Number(flight?.[key] ?? 0) === 1);
    if (allStepsCompleted) {
      completedFlightsCount++;
    }
  });
  return { completedFlights: completedFlightsCount, totalFlights: flights.length };
};

const renderPie = (data) => {
  const safeData = data || [];
  const hasData = safeData.some(d => d.value > 0);

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      {hasData ? (
        <>
          <ResponsiveContainer width="95%" height={300}>
            <PieChart>
              <Pie
                data={safeData}
                cx="50%"
                cy="50%"
                outerRadius="45%"
                dataKey="value"
                label={({ value }) => {
                  const total = safeData.reduce((sum, entry) => sum + entry.value, 0);
                  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${percent}%`;
                }}
                labelLine={false}
                stroke="none"
                isAnimationActive={false}
                startAngle={90}
                endAngle={-270}
              >
                {safeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: "80px", marginTop: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#f44336", fontWeight: "bold", fontSize: "18px" }}>
                {safeData[1].value}건
              </span>
              <span style={{ color: "#f44336", fontWeight: "bold" }}>■ 미완료</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#4caf50", fontWeight: "bold", fontSize: "18px" }}>
                {safeData[0].value}건
              </span>
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>■ 완료</span>
            </div>
          </div>
        </>
      ) : (
        <div style={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: "1.1rem"
        }}>데이터 없음</div>
      )}
    </div>
  );
};

const renderBar = (data) => {
  const safeData = data || [];
  const hasData = safeData.some(d => (d.완료 > 0 || d.미완료 > 0));

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      {hasData ? (
        <>
          <ResponsiveContainer width="95%" height={300}>
            <BarChart data={safeData} barSize={30} barGap={50}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={false} />
              <YAxis />
              <Bar dataKey="미완료" fill="#f44336" />
              <Bar dataKey="완료" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: "80px", marginTop: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#f44336", fontWeight: "bold", fontSize: "18px" }}>
                {safeData[0].미완료}건
              </span>
              <span style={{ color: "#f44336", fontWeight: "bold" }}>■ 미완료</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#4caf50", fontWeight: "bold", fontSize: "18px" }}>
                {safeData[0].완료}건
              </span>
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>■ 완료</span>
            </div>
          </div>
        </>
      ) : (
        <div style={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: "1.1rem"
        }}>데이터 없음</div>
      )}
    </div>
  );
};

function DashboardUI() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("http://211.42.159.18:8080/api/members");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const tomorrowData = useMemo(() =>
    data.filter(item => item.departuredate?.startsWith(tomorrowStr)),
  [data]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - day); // Go to the most recent Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Go to the next Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    return data.filter(item => {
      const depDateStr = item.departuredate;
      if (!depDateStr) return false;
      const d = new Date(depDateStr);
      return d >= startOfWeek && d <= endOfWeek;
    });
  }, [data]);

  const weekStep = useMemo(() => {
    const { completedFlights, totalFlights } = countCompletedFlights(weeklyData, ['bool_complete1', 'bool_complete2', 'bool_complete3', 'bool_complete5', 'bool_complete6', 'bool_complete7', 'bool_complete8']);
    return { completedSteps: completedFlights, totalSteps: totalFlights };
  }, [weeklyData]);

  const todayStep = useMemo(() => {
    const { completedFlights, totalFlights } = countCompletedFlights(tomorrowData, ['bool_complete1', 'bool_complete2', 'bool_complete3', 'bool_complete5', 'bool_complete6', 'bool_complete7', 'bool_complete8']);
    return { completedSteps: completedFlights, totalSteps: totalFlights };
  }, [tomorrowData]);

  const makeStep = useMemo(() => {
    const { completedFlights, totalFlights } = countCompletedFlights(tomorrowData, ['bool_complete1', 'bool_complete2', 'bool_complete3']);
    return { completedSteps: completedFlights, totalSteps: totalFlights };
  }, [tomorrowData]);

  const pickStep = useMemo(() => {
    const { completedFlights, totalFlights } = countCompletedFlights(tomorrowData, ['bool_complete5', 'bool_complete6']);
    return { completedSteps: completedFlights, totalSteps: totalFlights };
  }, [tomorrowData]);

  const washStep = useMemo(() => {
    const { completedFlights, totalFlights } = countCompletedFlights(tomorrowData, ['bool_complete7', 'bool_complete8']);
    return { completedSteps: completedFlights, totalSteps: totalFlights };
  }, [tomorrowData]);

  if (loading) return <div>데이터 불러오는 중...</div>;

  const makePie = [
    { name: "완료", value: makeStep.completedSteps },
    { name: "미완료", value: makeStep.totalSteps - makeStep.completedSteps }
  ];
  const makeBar = [{
    name: "Make&Pack",
    완료: makeStep.completedSteps,
    미완료: makeStep.totalSteps - makeStep.completedSteps
  }];
  const pickPie = [
    { name: "완료", value: pickStep.completedSteps },
    { name: "미완료", value: pickStep.totalSteps - pickStep.completedSteps }
  ];
  const pickBar = [{
    name: "Pick&Pack",
    완료: pickStep.completedSteps,
    미완료: pickStep.totalSteps - pickStep.completedSteps
  }];
  const washPie = [
    { name: "완료", value: washStep.completedSteps },
    { name: "미완료", value: washStep.totalSteps - washStep.completedSteps }
  ];
  const washBar = [{
    name: "Wash&Pack",
    완료: washStep.completedSteps,
    미완료: washStep.totalSteps - washStep.completedSteps
  }];
  const todayChart = {
    pie: [
      { name: "완료", value: todayStep.completedSteps },
      { name: "미완료", value: todayStep.totalSteps - todayStep.completedSteps }
    ],
    bar: [{
      name: "오늘",
      완료: todayStep.completedSteps,
      미완료: todayStep.totalSteps - todayStep.completedSteps
    }]
  };
  const weekChart = {
    pie: [
      { name: "완료", value: weekStep.completedSteps },
      { name: "미완료", value: weekStep.totalSteps - weekStep.completedSteps }
    ],
    bar: [{
      name: "이번 주",
      완료: weekStep.completedSteps,
      미완료: weekStep.totalSteps - weekStep.completedSteps
    }]
  };

  return (
    <div className="dashboard-ui-container">
      <h1>진행 스텝 현황(내일 출발 기준)</h1>
      <div className="department-container">
        <div className="department-card">
          <h2>이번 주 진행률</h2>
          <div className="chart-wrap">
            {renderPie(weekChart.pie)}
            {renderBar(weekChart.bar)}
          </div>
        </div>
        <div className="department-card">
          <h2>오늘 총 진행률</h2>
          <div className="chart-wrap">
            {renderPie(todayChart.pie)}
            {renderBar(todayChart.bar)}
          </div>
        </div>
        <div className="department-card">
          <h2>Make & Pack</h2>
          <div className="chart-wrap">
            {renderPie(makePie)}
            {renderBar(makeBar)}
          </div>
        </div>
        <div className="department-card">
          <h2>Pick & Pack</h2>
          <div className="chart-wrap">
            {renderPie(pickPie)}
            {renderBar(pickBar)}
          </div>
        </div>
        <div className="department-card">
          <h2>Wash & Pack</h2>
          <div className="chart-wrap">
            {renderPie(washPie)}
            {renderBar(washBar)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardUI;
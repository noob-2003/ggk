import React, { useEffect, useState } from "react";
import FlightTable from "../components/FlightTable";

// ✅ DB → FlightTable 매핑 (bool_complete1 추가)
const mapToFlightTableData = (item) => {
  return {
    id: item.id ?? "-",
    flight: item.flightNumber ?? "-",
    destination: item.destination ?? "-",
    aircraft: item.acversion ?? "-",
    departureDate: item.departuredate ?? "-",
    departureTime: item.arrivaltime ?? "-",
    // ✅ bool_complete1 포함 (테스트 전용)
    bool_complete1: item.bool_complete1 ?? 0,
  };
};

const MakeAndPack1 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 최초 로딩 (API에서 데이터 가져오기)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://211.42.159.18:8080/api/members");
        const json = await res.json();

        console.log("✅ API 응답:", json);

        const mapped = json.map((item) => mapToFlightTableData(item));
        console.log("✅ 변환된 데이터:", mapped);

        setData(mapped);
      } catch (err) {
        console.error("❌ 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ bool_complete1 토글 함수
  const toggleBoolComplete1 = async (id, currentValue) => {
    const newValue = currentValue === 1 ? 0 : 1;

    try {
      const res = await fetch(
        `http://211.42.159.18:8080/api/members/${id}/complete/1`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: newValue }),
        }
      );

      if (!res.ok) throw new Error("API 요청 실패");

      console.log("✅ bool_complete1 업데이트 성공");

      // ✅ 로컬 state 즉시 반영
      setData((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, bool_complete1: newValue } : m
        )
      );
    } catch (err) {
      console.error("❌ bool_complete1 업데이트 실패:", err);
      alert("업데이트 실패");
    }
  };

  if (loading) return <div>데이터 불러오는 중...</div>;

  return (
    <div>
      <h2
        style={{
          textAlign: "center",
          marginTop: "20px",
          marginBottom: "30px",
          fontSize: "24px",
        }}
      >
        Make and Pack 1 (bool_complete1 테스트)
      </h2>

      {/* ✅ FlightTable에 bool_complete1 토글 함수 넘김 */}
      <FlightTable data={data} toggleBoolComplete1={toggleBoolComplete1} />
    </div>
  );
};

export default MakeAndPack1;
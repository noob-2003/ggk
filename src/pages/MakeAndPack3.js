import React, { useEffect } from "react";
import FlightTable from "../components/FlightTable";
import { useMembers } from "../context/MembersContext";

// ✅ 안전한 시간 계산 함수
const calcTime = (baseDate, timeStr, offsetHours) => {
  if (!timeStr) return null;
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const dateObj = new Date(baseDate);
  dateObj.setHours(hours);
  dateObj.setMinutes(minutes);
  dateObj.setSeconds(seconds || 0);

  // offsetHours만큼 더하거나 빼기
  dateObj.setHours(dateObj.getHours() + offsetHours);
  return dateObj;
};

// ✅ Date → HH:mm:ss
const formatTime = (dateObj) => {
  if (!dateObj) return "-";
  const h = String(dateObj.getHours()).padStart(2, "0");
  const m = String(dateObj.getMinutes()).padStart(2, "0");
  const s = String(dateObj.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const MakeAndPack3 = () => {
  const { members, setMembers, loading } = useMembers();
    console.log("DEBUG >> useMembers() in MakeAndPack1:", {
    membersType: typeof members,
    setMembersType: typeof setMembers,
    setMembersValue: setMembers,
    membersLength: members?.length,
    loading,
  });

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

  // ✅ 백엔드 데이터 → 화면 표시용 데이터 변환
  const mapToFlightTableData = (item) => {
    const baseDate = new Date(item.departuredate ?? "1970-01-01");
    
    const rawDepartureTime = item.departuretime ?? null;
    const departureTime = extractTime(rawDepartureTime);

    // ✅ 작업시작 = 출발시간 - 6시간
    const startTimeObj = calcTime(baseDate, departureTime, -6);
    const startTime = formatTime(startTimeObj);

    // ✅ 작업종료 = 작업시작 + 2시간
    let endTime = "-";
    if (startTimeObj) {
      const endTimeObj = new Date(startTimeObj);
      endTimeObj.setHours(endTimeObj.getHours() + 2);
      endTime = formatTime(endTimeObj);
    }

    return {
      id: item.id ?? "-",
      flight: item.flightNumber ?? "-",
      destination: item.destination ?? "-",
      aircraft: item.acversion ?? "-",
      departureDate: item.departuredate ?? "-",
      departureTime: extractTime(item.departuretime) ?? "-",
      startTime: startTime,   // ✅ 출발 -6h
      endTime: endTime,       // ✅ 작업시작 +2h
      bool_complete1: item.bool_complete1 ?? 0,
      completeDate: item.completeDate ?? "-",
      completeTime: extractTime(item.completeTime) ?? "-"
    };
  };

  const mappedMembers = members.map(mapToFlightTableData);

  // ✅ 완료 체크 토글 (백엔드에는 bool만 전송)
  const toggleBoolComplete = async (id, step, currentValue) => {
    const newValue = currentValue === 1 ? 0 : 1;

    // UI에만 표시할 완료일자/시간
    let uiCompleteDate = "-";
    let uiCompleteTime = "-";
    if (newValue === 1) {
      const now = new Date();
      uiCompleteDate = now.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\.\s*/g, "/").replace(/\/$/, "");
      uiCompleteTime = now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    try {
      const res = await fetch(
        `http://211.42.159.18:8080/api/members/${id}/complete/${step}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: newValue }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API 응답 오류:", errorText);
        return;
      }

      console.log(`✅ bool_complete${step} 업데이트 성공 (id=${id}, step=${step}, newValue=${newValue})`);

      if (typeof setMembers !== 'function') {
        console.error("❌ CRITICAL: setMembers is not a function.");
        return;
      }

      // ⭐️ [수정] 상태를 즉시 업데이트하도록 수정
      setMembers((prev) => {
        if (!Array.isArray(prev)) {
          console.error("❌ prev가 배열이 아님:", prev);
          return prev;
        }

        const updated = prev.map((m) => {
          if (Number(m.id) === Number(id)) {
            return {
              ...m,
              [`bool_complete${step}`]: newValue,
              completeDate: uiCompleteDate,
              completeTime: uiCompleteTime,
            };
          }
          return m;
        });

        return updated;
      });
    } catch (err) {
      console.error("❌ 네트워크/로직 오류:", err);
    }
  };

  if (loading) return <div>데이터 불러오는 중...</div>;

  return (
    <div>
      <h2 style={{ textAlign: "center", margin: "20px 0", fontSize: "24px" }}>
        Make and Pack 3
      </h2>
      <FlightTable data={mappedMembers} toggleBoolComplete={toggleBoolComplete} />
    </div>
  );
};

export default MakeAndPack3;
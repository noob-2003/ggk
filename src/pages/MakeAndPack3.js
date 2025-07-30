import React from "react";
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

// ✅ Date → HH:mm
const formatTime = (dateObj) => {
  if (!dateObj) return "-";
  const h = String(dateObj.getHours()).padStart(2, "0");
  const m = String(dateObj.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const MakeAndPack3 = () => {
  const { members, setMembers, loading } = useMembers();

  console.log(`DEBUG >> useMembers() in MakeAndPack1:`, {
    membersType: typeof members,
    setMembersType: typeof setMembers,
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
  
    // 기존 "HH:mm:ss", "HH:mm" 형식
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
      startTime,
      endTime,
      bool_complete3: item.bool_complete3 ?? 0, // ✅ 고정
      comment: item.comment3 ?? "",              // ✅ 주석 필드 추가
      completeDate: item.completeDate ?? "-",
      completeTime: extractTime(item.completeTime) ?? "-",
    };
  };

  const mappedMembers = members.map(mapToFlightTableData);

  // ✅ 완료 체크 토글 (step=1 고정) + comment 업데이트 지원
  const toggleBoolComplete = async (id, step = 3, currentValue, comment = "") => {
    const newValue = currentValue === 1 ? 0 : 1;

    // UI에만 표시할 완료일자/시간
    let uiCompleteDate = "-";
    let uiCompleteTime = "-";
    if (newValue === 1) {
      const now = new Date();
      uiCompleteDate = now
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\.\s*/g, "/")
        .replace(/\/$/, "");
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
          body: JSON.stringify({ 
            value: newValue,
            comment: comment || ""  // ✅ 주석도 같이 업데이트
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API 응답 오류:", errorText);
        return;
      }

      console.log(
        `✅ bool_complete${step} + comment 업데이트 성공 (id=${id}, step=${step}, newValue=${newValue}, comment=${comment})`
      );

      if (typeof setMembers !== "function") {
        console.error("❌ CRITICAL: setMembers is not a function.");
        return;
      }

      // ✅ 상태 즉시 업데이트
      setMembers((prev) =>
        prev.map((m) =>
          Number(m.id) === Number(id)
            ? {
                ...m,
                [`bool_complete${step}`]: newValue,
                comment: comment, // ✅ 주석도 UI 반영
                completeDate: uiCompleteDate,
                completeTime: uiCompleteTime,
              }
            : m
        )
      );
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
      <FlightTable
        data={mappedMembers}
        toggleBoolComplete={toggleBoolComplete}
        makeOnly={true}
      />
    </div>
  );
};

export default MakeAndPack3;
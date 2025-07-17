import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch 함수: 버튼 클릭 시 호출 가능
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://211.42.159.18:8080/api/members");
      const json = await res.json();
      setMembers(json);
    } catch (err) {
      console.error("❌ 데이터 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 마운트 시 한번만 데이터 불러오기
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <MembersContext.Provider value={{ members, loading, fetchMembers }}>
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => useContext(MembersContext);
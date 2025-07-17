import React, { useEffect, useState } from 'react';
import DashboardTable from '../components/DashboardTable';

const DashboardPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://211.42.159.18:8080/api/members'); // ← 여기를 백엔드 API 경로로 바꿔야 함
                const json = await response.json();
                setData(json);
            } catch (error) {
                console.error('데이터 불러오기 실패:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div>데이터 불러오는 중...</div>;

    return (
        <div>
            <h1>대시보드 페이지</h1>
            <DashboardTable data={data} />
        </div>
    );
};
export default DashboardPage;
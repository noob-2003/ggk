import React, { useState } from 'react';
// ⭐️ [수정] BrowserRouter를 Router로 사용하지 않고 직접 가져옵니다.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainPage from './pages/MainPage';
import PickAndPack1 from './pages/PickAndPack1';
import PickAndPack2 from './pages/PickAndPack2';
import WashAndPack1 from './pages/WashAndPack1';
import WashAndPack2 from './pages/WashAndPack2';
import MakeAndPack1 from './pages/MakeAndPack1';
import MakeAndPack2 from './pages/MakeAndPack2';
import MakeAndPack3 from './pages/MakeAndPack3';
import DashboardPage from './pages/DashboardPage';
import AdminLogin from './pages/AdminLogin';
import FileUpload from './pages/FileUpload';
import DashboardUI from './pages/DashboardUI';

// ✅ 전역 상태 추가 (MembersProvider)
import { MembersProvider } from './context/MembersContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    // ⭐️ [수정] BrowserRouter를 최상위로 이동
    <BrowserRouter>
      {/* ⭐️ [수정] MembersProvider를 BrowserRouter 안으로 이동 */}
      <MembersProvider>
        <Routes>
          {/* 기본 메인 페이지 */}
          <Route path="/" element={<MainPage />} /> 

          {/* Pick & Pack */}
          <Route path="/pick-pack1" element={<PickAndPack1 />} />
          <Route path="/pick-pack2" element={<PickAndPack2 />} />

          {/* Wash & Pack */}
          <Route path="/wash-pack1" element={<WashAndPack1 />} />
          <Route path="/wash-pack2" element={<WashAndPack2 />} />
          
          {/* Make & Pack */}
          <Route path="/make-pack1" element={<MakeAndPack1 />} />
          <Route path="/make-pack2" element={<MakeAndPack2 />} />
          <Route path="/make-pack3" element={<MakeAndPack3 />} />

          {/* Admin 로그인 */}
          <Route path="/admin-login" element={<AdminLogin onLogin={() => setIsAuthenticated(true)} />} />
          
          {/* 대시보드 페이지 */}
          <Route path="/dashboard" element={<DashboardPage />} />
          {/*<Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/admin-login" replace />} />*/}

          <Route path="/dashboardUI" element={<DashboardUI />} />
          {/*<Route path="/dashboardUI" element={isAuthenticated ? <DashboardUI /> : <Navigate to="/admin-login" replace />} />*/}

          {/* 파일 업로드 */}
          <Route
            path="/file-upload"
            element={
              isAuthenticated ? <FileUpload /> : <Navigate to="/admin-login" replace />
            }
          />
        </Routes>
      </MembersProvider>
    </BrowserRouter>
  );
}

export default App;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();

  // 로그인 페이지로 이동하면서 redirect 파라미터 추가
  const goToLoginWithRedirect = (redirectPath) => {
    navigate(`/admin-login?redirect=${redirectPath}`);
  };

  return (
    <div className="landing-container">
      <h1 className="main-title">GGK Checklist 메인 페이지</h1>
      <div className="department-sections">
        <div className="department-column">
          <h2>Make and Pack 부서 페이지</h2>
          <button className="department-button" onClick={() => navigate('/make-pack1')}>MNP_EY_COLD</button>
          <button className="department-button" onClick={() => navigate('/make-pack2')}>MNP_BC_COLD</button>
          <button className="department-button" onClick={() => navigate('/make-pack3')}>MNP_BC_HOT</button>
          <button className="department-button" onClick={() => navigate('/make-pack4')}>MNP_EY_HOT</button>
        </div>
        <div className="department-column">
          <h2>Pick and Pack 부서 페이지</h2>
          <button className="department-button" onClick={() => navigate('/pick-pack1')}>PNP_소모품</button>
          <button className="department-button" onClick={() => navigate('/pick-pack2')}>PNP_BEV</button>
        </div>
        <div className="department-column">
          <h2>Wash and Pack 부서 페이지</h2>
          <button className="department-button" onClick={() => navigate('/wash-pack1')}>WNP_서빙툴</button>
          <button className="department-button" onClick={() => navigate('/wash-pack2')}>WNP_EQ</button>
        </div>
      </div>

      <hr className="separator" />

      <div className="admin-section">
        <h2>관리자 화면</h2>
        <div className="admin-buttons-container">
          {/* 대시보드 게시판형 → 로그인 후 /dashboard 이동 */}
          <button className="admin-button" onClick={() => goToLoginWithRedirect('/dashboard')}>
            대시보드 게시판형
          </button>

          {/* 대시보드 UI형 → 로그인 후 /dashboardUI 이동 */}
          <button className="admin-button" onClick={() => goToLoginWithRedirect('/dashboardUI')}>
            대시보드 UI형
          </button>

          {/* CSV Upload → 로그인 후 /file-upload 이동 */}
          <button className="admin-button" onClick={() => goToLoginWithRedirect('/file-upload')}>
            CSV Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
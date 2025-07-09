import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 로그인 로직은 아직 없음, 바로 메인으로 이동
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h2 className="login-title">관리자 로그인</h2>
        <div className="login-box">
          <input type="text" placeholder="ID" className="login-input" />
          <input type="password" placeholder="Password" className="login-input" />
          <button className="login-button" onClick={handleLogin}>Log in</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
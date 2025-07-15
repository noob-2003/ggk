import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // URL 파라미터에서 redirect 값 읽기 (없으면 기본값 /dashboard)
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/dashboard';

   const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://211.42.159.18:8080/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const isSuccess = await response.json();

      if (isSuccess) {
        if (onLogin) onLogin();
        navigate(redirectPath, { replace: true });
      } else {
        alert('비밀번호가 틀렸습니다');
      }
    } catch (error) {
      alert('서버 연결 실패 또는 오류 발생');
      console.error('로그인 오류:', error); // ','로 구분
    } finally {
      setLoading(false); // L 소문자
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h2 className="login-title">관리자 로그인</h2>
        <div className="login-box">
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button className="login-button" onClick={handleLogin} disabled={loading}>Log in</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
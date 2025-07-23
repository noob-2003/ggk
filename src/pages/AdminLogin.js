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
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://211.42.159.18:8080/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (result.success === true) {
        // 로그인 성공
        if (onLogin) onLogin();
        navigate(redirectPath, { replace: true });
      } else {
        // 로그인 실패
        alert(result.message || '비밀번호가 틀렸습니다.');
      }
    } catch (error) {
      alert('서버 연결 실패 또는 오류 발생');
      console.error('로그인 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h2 className="login-title">관리자 로그인</h2>

        <form
          className="login-box"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className={`login-button ${password ? 'active' : ''}`}
            disabled={loading}
          >
            {loading ? '로그인 중...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
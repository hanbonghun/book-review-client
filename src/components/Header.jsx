import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // 사용자 정보를 가져오는 함수
  const fetchUserInfo = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch('http://localhost:8080/api/members/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setUserInfo(null);
    navigate('/');
  };

  useEffect(() => {
    // 페이지 로드시 로컬 스토리지의 토큰 확인
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      fetchUserInfo();
    }
  }, []);

  // OAuth 로그인 완료 후 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      fetchUserInfo(); // 로그인 성공 후 사용자 정보 조회
      
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/';
      sessionStorage.removeItem('redirectUrl');
      navigate(redirectUrl, { replace: true });
    }
  }, [navigate]);

  const handleKakaoLogin = () => {
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };

  return (
    <header className="w-full bg-white shadow-md fixed top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
          My App
        </div>

        <nav className="hidden md:flex space-x-6">
          <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors">홈</a>
          <a href="/about" className="text-gray-700 hover:text-gray-900 transition-colors">소개</a>
        </nav>

        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {userInfo?.name || userInfo?.email}님 환영합니다
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button 
            onClick={handleKakaoLogin}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FEE500] hover:bg-[#FDD835] transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <img 
              src="image/kakao_login_medium.png"
              alt="카카오 로그인"
              className="h-6"
            />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
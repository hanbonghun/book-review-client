import React from 'react';

const Header = () => {
  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };

  return (
    <header className="w-full bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고나 사이트 이름 */}
        <div className="text-xl font-bold">
          도서 리뷰
        </div>

        {/* 네비게이션 메뉴들 */}
        <nav className="hidden md:flex space-x-4">
          <a href="/" className="hover:text-gray-600">홈</a>
          <a href="/about" className="hover:text-gray-600">소개</a>
        </nav>

        {/* 카카오 로그인 이미지 */}
        <img 
          src="image/kakao_login_medium.png"
          alt="카카오 로그인"
          className="cursor-pointer hover:opacity-90"
          onClick={handleKakaoLogin}
        />
      </div>
    </header>
  );
};

export default Header;
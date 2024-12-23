import React, { useEffect } from 'react';

const OAuthCallback = () => {
  useEffect(() => {
    // URL에서 토큰 정보 가져오기 (서버 구성에 따라 다를 수 있음)
    const token = new URLSearchParams(window.location.search).get('token');
    
    if (token) {
      // 토큰 저장
      localStorage.setItem('accessToken', token);
      // 메인 페이지로 리다이렉트
      window.location.href = '/';
    }
  }, []);

  return <div>로그인 처리 중...</div>;
};

export default OAuthCallback;
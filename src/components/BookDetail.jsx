import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BookDetail = () => {
  const { isbn } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/books/${isbn}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        const data = await response.json();
        
        if (data.result === 'SUCCESS') {
          setBook(data.data);
        }
      } catch (error) {
        console.error('책 정보를 불러오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [isbn]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">책을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 책 이미지 */}
          <div className="w-full md:w-1/3">
            <img
              src={book.imageUrl || '/placeholder-book.png'}
              alt={book.title}
              className="w-full rounded-lg shadow object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-book.png';
              }}
            />
          </div>

          {/* 책 정보 */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-semibold">저자:</span> {book.author || '정보 없음'}
              </p>
              <p>
                <span className="font-semibold">출판사:</span> {book.publisher}
              </p>
              <p>
                <span className="font-semibold">출판일:</span> {book.publishedDate}
              </p>
              <p>
                <span className="font-semibold">ISBN:</span> {book.isbn}
              </p>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">책 소개</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {book.description || '책 소개가 없습니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* 여기에 리뷰 섹션을 추가할 수 있습니다 */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">리뷰</h2>
          <p className="text-gray-500">아직 리뷰 기능이 준비중입니다.</p>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
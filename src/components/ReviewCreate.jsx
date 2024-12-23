import React, { useState, useEffect, useCallback } from 'react';

const ReviewCreate = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    content: '',
    readingStatus: 'READ'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchBooks = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:8080/api/books/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      const data = await response.json();
      if (data.result === 'SUCCESS') {
        setSearchResults(data.data.items);
      }
    } catch (error) {
      console.error('책 검색 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleSubmitReview = async () => {
    if (!selectedBook) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          isbn: selectedBook.isbn,
          rating: parseInt(reviewData.rating),
          content: reviewData.content,
          readingStatus: reviewData.readingStatus
        })
      });

      const data = await response.json();
      if (data.result === 'SUCCESS') {
        setIsModalOpen(false);
        setSelectedBook(null);
        setReviewData({
          rating: 5,
          content: '',
          readingStatus: 'READ'
        });
        // TODO: 성공 메시지 표시
      }
    } catch (error) {
      console.error('리뷰 등록 중 오류 발생:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    return <span className="text-yellow-500">{stars}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 검색 섹션 */}
      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
            placeholder="책 제목, 저자를 검색하세요"
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchBooks}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            검색
          </button>
        </div>

        {/* 검색 결과 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((book) => (
            <div
              key={book.isbn}
              onClick={() => {
                setSelectedBook(book);
                setIsModalOpen(true);
              }}
              className="flex gap-4 p-4 border rounded-lg hover:shadow-lg cursor-pointer transition-shadow"
            >
              <img
                src={book.image || '/placeholder-book.png'}
                alt={book.title}
                className="w-24 h-32 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-book.png';
                }}
              />
              <div className="flex-1">
                <h3 className="font-medium line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                <p className="text-sm text-gray-500">{book.publisher}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedBook.title}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 평점 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  평점
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setReviewData(prev => ({ ...prev, rating: num }))}
                      className={`text-2xl ${num <= reviewData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* 독서 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  독서 상태
                </label>
                <select
                  value={reviewData.readingStatus}
                  onChange={(e) => setReviewData(prev => ({ ...prev, readingStatus: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="READ">읽음</option>
                  <option value="READING">읽는 중</option>
                  <option value="WANT_TO_READ">읽고 싶음</option>
                </select>
              </div>

              {/* 리뷰 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  리뷰 내용
                </label>
                <textarea
                  value={reviewData.content}
                  onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="이 책에 대한 생각을 자유롭게 적어주세요"
                  className="w-full h-32 p-2 border rounded-lg resize-none"
                />
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  리뷰 등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCreate;
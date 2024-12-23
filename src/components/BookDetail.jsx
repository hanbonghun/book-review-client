import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ThumbsUp } from 'lucide-react'

const BookDetail = () => {
    const { isbn } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasNext, setHasNext] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const observerRef = useRef(null);

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

  const fetchReviews = async (cursor = null) => {
    try {
      setReviewsLoading(true);
      const url = new URL(`http://localhost:8080/api/books/${isbn}/reviews`);
      url.searchParams.set('size', '5');
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();

      if (data.result === 'SUCCESS') {
        // 서버에서 받은 데이터 그대로 사용
        if (cursor) {
          setReviews(prev => [...prev, ...data.data.reviews]);
        } else {
          setReviews(data.data.reviews);
        }
        setNextCursor(data.data.nextCursor);
        setHasNext(data.data.hasNext);
      }
    } catch (error) {
      console.error('리뷰를 불러오는 중 오류 발생:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleLike = async (reviewId, likedByCurrentUser) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const method = likedByCurrentUser ? 'DELETE' : 'POST';
      
      const response = await fetch(`http://localhost:8080/api/reviews/${reviewId}/likes`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId
              ? {
                  ...review,
                  likedByCurrentUser: !likedByCurrentUser,
                  likeCount: likedByCurrentUser 
                    ? review.likeCount - 1 
                    : review.likeCount + 1
                }
              : review
          )
        );
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류 발생:', error);
    }
  };

  const lastReviewRef = useCallback(node => {
    if (reviewsLoading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNext) {
        fetchReviews(nextCursor);
      }
    }, { threshold: 1.0 });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [reviewsLoading, hasNext, nextCursor]);

  useEffect(() => {
    fetchReviews();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isbn]);

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  const ExpandableText = ({ text, maxLength }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldShowButton = text.length > maxLength;
  
    const displayText = isExpanded ? text : text.slice(0, maxLength);
  
    return (
      <div className="relative">
        <div className={`relative ${!isExpanded && shouldShowButton ? 'max-h-48 overflow-hidden' : ''}`}>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {displayText}
            {!isExpanded && shouldShowButton && '...'}
          </p>
          
          {!isExpanded && shouldShowButton && (
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
        
        {shouldShowButton && (
          <div className="flex justify-start mt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 text-sm hover:underline transition-all duration-200 font-bold"
            >
              {isExpanded ? '접기 ∧' : '더보기 ∨'}
            </button>
          </div>
        )}
      </div>
    );
    }

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
              <ExpandableText text={book.description || '책 소개가 없습니다.'} maxLength={200} />
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">리뷰</h2>
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div
                  ref={index === reviews.length - 1 ? lastReviewRef : null}
                  key={`${review.id}-${index}`}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{review.memberName}</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.content}</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLike(review.id, review.likedByCurrentUser)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                        review.likedByCurrentUser
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp size={16} className={review.likedByCurrentUser ? 'fill-blue-600' : ''} />
                      <span>{review.likeCount}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
            )}
            {reviewsLoading && (
              <div className="text-center py-4">
                <div className="text-gray-500">리뷰를 불러오는 중...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
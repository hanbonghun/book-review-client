import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';

const RecentReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  const containerRef = useRef(null);

  const fetchReviews = async (cursor = null) => {
    try {
      setLoading(true);
      const url = new URL('http://localhost:8080/api/reviews');
      url.searchParams.set('size', '3');
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
      setLoading(false);
    }
  };

  const lastReviewRef = useCallback(node => {
    if (loading) return;
    
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
  }, [loading, hasNext, nextCursor]);

  useEffect(() => {
    fetchReviews();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="max-w-full px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 px-4">최근 리뷰</h2>
      <div 
        ref={containerRef}
        className="flex overflow-x-auto space-x-4 pb-4 px-4 snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {reviews.map((review, index) => (
          <div
            ref={index === reviews.length - 1 ? lastReviewRef : null}
            key={review.id}
            className="flex-none w-80 bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 snap-start"
          >
            <h3 className="text-xl font-semibold mb-2 line-clamp-2">{review.bookTitle}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
              {review.bookAuthors.split('^').join(', ')} | {review.publisher}
            </p>
            <div className="flex items-center space-x-1 mb-3">
              {renderStars(review.rating)}
            </div>
            <p className="text-gray-800 mb-4 line-clamp-3">{review.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{review.memberName}</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex-none w-80 bg-white rounded-lg shadow p-6 flex items-center justify-center">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        )}
      </div>
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RecentReviews;
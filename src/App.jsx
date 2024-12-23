import Header from './components/Header'
import RecentReviews from './components/RecentReviews'
import BookDetail from './components/BookDetail'
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="mt-16"> {/* Header 높이만큼 margin 추가 */}
        <Routes>
          <Route path="/" element={<RecentReviews />} />
          <Route path="/books/:isbn" element={<BookDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
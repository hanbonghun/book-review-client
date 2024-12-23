import Header from './components/Header'
import { BrowserRouter } from 'react-router-dom';
import RecentReviews from './components/RecentReviews'


function App() {
  return (
    <>
    <BrowserRouter>
      <Header />
      <RecentReviews />
    </BrowserRouter>
    </>
  )
}

export default App
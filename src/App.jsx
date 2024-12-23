import Header from './components/Header'
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <>
    <BrowserRouter>
      <Header />
      {/* 다른 컴포넌트들 */}
    </BrowserRouter>
    </>
  )
}

export default App
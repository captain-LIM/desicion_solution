import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Result from './pages/Result';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f0f13] text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

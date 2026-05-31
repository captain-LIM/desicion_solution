import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Result from './pages/Result';
import History from './pages/History';
import Share from './pages/Share';

function Layout() {
  const { pathname } = useLocation();
  const isShare = pathname.startsWith('/share/');

  return (
    <div className="min-h-screen bg-[#f8f8fc] text-gray-900 dark:bg-[#0f0f13] dark:text-white transition-colors duration-200">
      {!isShare && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<History />} />
        <Route path="/share/:id" element={<Share />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;

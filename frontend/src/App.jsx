import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Result from './pages/Result';
import History from './pages/History';
import Stats from './pages/Stats';
import Insights from './pages/Insights';
import Share from './pages/Share';
import Login from './pages/Login';
import Register from './pages/Register';

function Layout() {
  const { pathname } = useLocation();
  const hideNav = pathname.startsWith('/share/') || pathname === '/login' || pathname === '/register';

  return (
    <div className="min-h-screen bg-[#f8f8fc] text-gray-900 dark:bg-[#0f0f13] dark:text-white transition-colors duration-200">
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:id" element={<Share />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
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

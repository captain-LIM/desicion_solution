import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, History, Home, Sun, Moon, LogOut, User, BarChart2, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const links = [
    { to: '/', label: '홈', icon: Home },
    { to: '/history', label: '히스토리', icon: History },
    { to: '/stats', label: '통계', icon: BarChart2 },
    { to: '/insights', label: '인사이트', icon: Lightbulb },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-[#f8f8fc]/80 backdrop-blur-md dark:border-white/10 dark:bg-[#0f0f13]/80 transition-colors duration-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/30">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-300 transition-colors">
            DecideAI
          </span>
        </Link>

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                pathname === to
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-600/20 dark:text-violet-300'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
              )}>
              <Icon size={16} />{label}
            </Link>
          ))}

          {/* 테마 토글 */}
          <button onClick={toggleTheme}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* 유저 드롭다운 */}
          {user && (
            <div className="relative ml-1" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-600/30">
                  <User size={12} className="text-violet-600 dark:text-violet-400" />
                </div>
                <span className="max-w-[80px] truncate">{user.name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#1a1a24]">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-white/5">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition dark:hover:bg-red-500/10">
                    <LogOut size={14} />로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, History, Home, Sun, Moon, LogOut, User, BarChart2, Lightbulb, Users } from 'lucide-react';
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
    { to: '/community', label: '커뮤니티', icon: Users },
  ];

  return (
    <nav className="lg:hidden sticky top-0 z-50 border-b border-gray-100 bg-white dark:border-white/[0.07] dark:bg-[#111118]">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
            <BrainCircuit size={15} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">DecideAI</span>
        </Link>

        <div className="flex items-center gap-0.5">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              title={label}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition',
                pathname === to
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/[0.12] dark:text-violet-300'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/[0.04] dark:hover:text-white'
              )}
            >
              <Icon size={17} />
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/[0.04] dark:hover:text-white"
            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user && (
            <div className="relative ml-0.5" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 dark:text-gray-500 dark:hover:bg-white/[0.04]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
                  <User size={13} className="text-violet-600 dark:text-violet-400" />
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-gray-100 bg-white shadow-lg dark:border-white/[0.07] dark:bg-[#1a1a24]">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-white/[0.07]">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition dark:hover:bg-red-500/10"
                  >
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

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Home, History, BarChart2, Lightbulb, Users, Sun, Moon, LogOut, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: '홈', icon: Home },
  { to: '/history', label: '히스토리', icon: History },
  { to: '/stats', label: '통계', icon: BarChart2 },
  { to: '/insights', label: '인사이트', icon: Lightbulb },
  { to: '/community', label: '커뮤니티', icon: Users },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex w-[220px] shrink-0 flex-col sticky top-0 h-screen border-r border-gray-200 bg-[#f8f8fc] dark:border-white/10 dark:bg-[#0f0f13] transition-colors duration-200">
      {/* 로고 */}
      <Link to="/" className="flex items-center gap-2.5 px-5 py-6 group">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/30">
          <BrainCircuit size={20} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-300">
          DecideAI
        </span>
      </Link>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-0.5 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              pathname === to
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-600/20 dark:text-violet-300'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* 하단 유저 영역 */}
      <div className="border-t border-gray-200 p-3 dark:border-white/10">
        <button
          onClick={toggleTheme}
          className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {theme === 'dark' ? '라이트 모드' : '다크 모드'}
        </button>
        {user && (
          <>
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-600/30">
                <User size={13} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-800 dark:text-white">{user.name}</p>
                <p className="truncate text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut size={17} />로그아웃
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

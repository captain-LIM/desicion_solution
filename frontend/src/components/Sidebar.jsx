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
    <aside className="hidden lg:flex w-[220px] shrink-0 flex-col sticky top-0 h-screen border-r border-gray-100 bg-white dark:border-white/[0.07] dark:bg-[#111118]">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600">
          <BrainCircuit size={17} className="text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
          DecideAI
        </span>
      </Link>

      <div className="mx-4 h-px bg-gray-100 dark:bg-white/[0.07]" />

      <nav className="flex-1 space-y-0.5 px-3 pt-3">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              pathname === to
                ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/[0.12] dark:text-violet-300'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.04] dark:hover:text-white'
            )}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <div className="h-px bg-gray-100 dark:bg-white/[0.07] mb-2" />
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.04] dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? '라이트 모드' : '다크 모드'}
        </button>
        {user && (
          <>
            <div className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
                <User size={12} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-800 dark:text-white">{user.name}</p>
                <p className="truncate text-[11px] text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut size={16} />로그아웃
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

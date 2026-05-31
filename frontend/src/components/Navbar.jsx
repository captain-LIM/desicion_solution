import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, History, Home, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: '/', label: '홈', icon: Home },
    { to: '/history', label: '히스토리', icon: History },
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

        {/* 메뉴 + 테마 토글 */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                pathname === to
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-600/20 dark:text-violet-300'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          {/* 테마 토글 버튼 */}
          <button
            onClick={toggleTheme}
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

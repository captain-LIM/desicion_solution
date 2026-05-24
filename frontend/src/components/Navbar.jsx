import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, History, Home } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: '홈', icon: Home },
    { to: '/history', label: '히스토리', icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0f0f13]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/30">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
            DecideAI
          </span>
        </Link>

        {/* 메뉴 */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                pathname === to
                  ? 'bg-violet-600/20 text-violet-300 shadow-inner'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

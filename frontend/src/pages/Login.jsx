import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BrainCircuit, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-violet-500/50 dark:focus:ring-violet-500/20';

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      {/* 로고 */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/30">
            <BrainCircuit size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">DecideAI</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">로그인</h1>
        <p className="mt-2 text-sm text-gray-500">계정에 로그인하여 기기 간 히스토리를 동기화하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 dark:border-white/10 dark:bg-white/5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com" required className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력" required className={cn(input, 'pr-11')} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className={cn('flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition',
            loading ? 'cursor-not-allowed bg-violet-300 text-white dark:bg-violet-700/50 dark:text-violet-300'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500'
          )}>
          {loading ? <><Loader2 size={18} className="animate-spin" />로그인 중...</> : '로그인'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        계정이 없으신가요?{' '}
        <Link to="/register" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
          회원가입
        </Link>
      </p>
    </main>
  );
}

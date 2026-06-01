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

  const input = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/15 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder-gray-500 dark:focus:border-violet-500/60 dark:focus:bg-white/[0.06]';

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
              <BrainCircuit size={19} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">DecideAI</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">로그인</h1>
          <p className="mt-1.5 text-sm text-gray-500">계정에 로그인하여 히스토리를 동기화하세요</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#16161f]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com" required className={input} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력" required className={cn(input, 'pr-10')} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className={cn('mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition',
                loading
                  ? 'cursor-not-allowed bg-violet-300 text-white dark:bg-violet-900/60 dark:text-violet-400'
                  : 'bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500'
              )}>
              {loading ? <><Loader2 size={15} className="animate-spin" />로그인 중...</> : '로그인'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link to="/register" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

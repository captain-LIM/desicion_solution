import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BrainCircuit, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle');
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    if (!emailTouched || !email) { setEmailStatus('idle'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setEmailStatus('idle'); return; }

    setEmailStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get('/api/auth/check-email', { params: { email } });
        setEmailStatus(data.available ? 'available' : 'taken');
      } catch {
        setEmailStatus('idle');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email, emailTouched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailStatus === 'taken') return setError('이미 사용 중인 이메일입니다.');
    if (emailStatus === 'checking') return setError('이메일 확인 중입니다. 잠시 후 다시 시도해주세요.');
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password });
      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full rounded-lg border bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition dark:bg-white/[0.03] dark:text-white dark:placeholder-gray-500';

  const emailBorderClass = {
    idle: 'border-gray-200 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/15 dark:border-white/[0.08] dark:focus:border-violet-500/60 dark:focus:bg-white/[0.06]',
    checking: 'border-gray-200 dark:border-white/[0.08]',
    available: 'border-green-400 focus:ring-2 focus:ring-green-400/15 dark:border-green-500/50',
    taken: 'border-red-400 focus:ring-2 focus:ring-red-400/15 dark:border-red-500/50',
  };

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">회원가입</h1>
          <p className="mt-1.5 text-sm text-gray-500">기기 간 결정 히스토리를 동기화하세요</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#16161f]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="홍길동" required
                className={cn(input, 'border-gray-200 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/15 dark:border-white/[0.08] dark:focus:border-violet-500/60 dark:focus:bg-white/[0.06]')} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                  placeholder="example@email.com"
                  required
                  className={cn(input, emailBorderClass[emailStatus], 'pr-10')}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailStatus === 'checking' && <Loader2 size={15} className="animate-spin text-gray-400" />}
                  {emailStatus === 'available' && <CheckCircle2 size={15} className="text-green-500" />}
                  {emailStatus === 'taken' && <XCircle size={15} className="text-red-500" />}
                </div>
              </div>
              {emailStatus === 'available' && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">사용 가능한 이메일입니다.</p>
              )}
              {emailStatus === 'taken' && (
                <p className="mt-1 text-xs text-red-500">이미 사용 중인 이메일입니다.</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
                <span className="ml-1 text-xs font-normal text-gray-400">(6자 이상)</span>
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력" required
                  className={cn(input, 'border-gray-200 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/15 pr-10 dark:border-white/[0.08] dark:focus:border-violet-500/60 dark:focus:bg-white/[0.06]')} />
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

            <button type="submit" disabled={loading || emailStatus === 'taken' || emailStatus === 'checking'}
              className={cn('mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition',
                loading || emailStatus === 'taken' || emailStatus === 'checking'
                  ? 'cursor-not-allowed bg-violet-300 text-white dark:bg-violet-900/60 dark:text-violet-400'
                  : 'bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500'
              )}>
              {loading ? <><Loader2 size={15} className="animate-spin" />가입 중...</> : '회원가입'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

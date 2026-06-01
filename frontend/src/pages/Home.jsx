import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { CATEGORIES } from '../lib/categories';
import ReviewBanner from '../components/ReviewBanner';

export default function Home() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [emotionalState, setEmotionalState] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/decisions/stats').catch(() => {});
  }, []);

  const addOption = () => { if (options.length < 5) setOptions([...options, '']); };
  const removeOption = (idx) => { if (options.length > 2) setOptions(options.filter((_, i) => i !== idx)); };
  const updateOption = (idx, value) => { const u = [...options]; u[idx] = value; setOptions(u); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const filledOptions = options.filter((o) => o.trim());
    if (!scenario.trim()) return setError('고민 상황을 입력해주세요.');
    if (filledOptions.length < 2) return setError('최소 2개의 선택지를 입력해주세요.');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/decisions', {
        scenario: scenario.trim(),
        options: filledOptions,
        emotional_state: emotionalState.trim() || undefined,
        category: category || undefined,
      });
      navigate('/result', { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.error || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/15 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder-gray-500 dark:focus:border-violet-500/60 dark:focus:bg-white/[0.06]';

  return (
    <>
      <ReviewBanner />
      <main className="mx-auto max-w-xl px-5 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">고민 해결하기</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">선택지를 입력하면 AI가 최적의 결정을 추천해드립니다</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#16161f]">
            {/* 카테고리 */}
            <div className="p-5">
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                카테고리
                <span className="ml-1.5 text-xs font-normal text-gray-400">(선택사항)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(category === cat.value ? '' : cat.value)}
                    className={cn(
                      'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition',
                      category === cat.value
                        ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-400 dark:hover:border-white/20'
                    )}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mx-5 h-px bg-gray-100 dark:bg-white/[0.07]" />

            {/* 고민 상황 */}
            <div className="p-5">
              <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                고민 상황 <span className="text-violet-500">*</span>
              </label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="어떤 것을 결정해야 하나요? 상황을 자세히 설명해주세요."
                rows={4}
                className={cn(input, 'resize-none')}
              />
            </div>

            <div className="mx-5 h-px bg-gray-100 dark:bg-white/[0.07]" />

            {/* 선택지 */}
            <div className="p-5">
              <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                선택지 <span className="text-violet-500">*</span>
                <span className="ml-1.5 text-xs font-normal text-gray-400">최소 2개, 최대 5개</span>
              </label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-400">
                      {idx + 1}
                    </span>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`선택지 ${idx + 1}`}
                      className={input}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-gray-400 transition hover:text-violet-600 dark:hover:text-violet-400"
                >
                  <Plus size={13} />선택지 추가
                </button>
              )}
            </div>

            <div className="mx-5 h-px bg-gray-100 dark:bg-white/[0.07]" />

            {/* 감정 상태 */}
            <div className="p-5">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                현재 감정 상태
                <span className="ml-1.5 text-xs font-normal text-gray-400">(선택사항)</span>
              </label>
              <input
                value={emotionalState}
                onChange={(e) => setEmotionalState(e.target.value)}
                placeholder="예: 불안하고 스트레스가 많은 상태, 신중하게 결정하고 싶음"
                className={input}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
              loading
                ? 'cursor-not-allowed bg-violet-300 text-white dark:bg-violet-900/60 dark:text-violet-400'
                : 'bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.99] dark:hover:bg-violet-500'
            )}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />AI가 분석 중입니다...</>
            ) : (
              <><Sparkles size={16} />AI에게 추천받기</>
            )}
          </button>
        </form>
      </main>
    </>
  );
}

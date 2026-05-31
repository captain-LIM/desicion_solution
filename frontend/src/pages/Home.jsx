import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Sparkles, Loader2, Brain } from 'lucide-react';
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

  const card = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5';
  const input = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-violet-500/50 dark:focus:ring-violet-500/20';
  const label = 'mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300';

  return (
    <>
      <ReviewBanner />
      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* 헤더 */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-50 px-4 py-1.5 text-sm text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            <Brain size={14} />
            AI 기반 의사결정 도우미
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            고민을 해결해드릴게요
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            선택지를 입력하면 AI가 최적의 결정을 추천해드립니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 카테고리 */}
          <div className={card}>
            <label className={label}>
              카테고리
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">(선택사항)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(category === cat.value ? '' : cat.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition',
                    category === cat.value
                      ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-200'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-200'
                  )}
                >
                  <span>{cat.emoji}</span>{cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 고민 상황 */}
          <div className={card}>
            <label className={label}>
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

          {/* 선택지 */}
          <div className={card}>
            <label className={label}>
              선택지 <span className="text-violet-500">*</span>
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">(최소 2개, 최대 5개)</span>
            </label>
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-600/20 dark:text-violet-400">
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
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-50 hover:text-violet-600 dark:hover:bg-white/5 dark:hover:text-violet-300"
              >
                <Plus size={15} />선택지 추가
              </button>
            )}
          </div>

          {/* 감정 상태 */}
          <div className={card}>
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              현재 감정 상태
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">(선택사항)</span>
            </label>
            <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
              현재 심리 상태를 알려주시면 더 정확한 추천이 가능합니다
            </p>
            <input
              value={emotionalState}
              onChange={(e) => setEmotionalState(e.target.value)}
              placeholder="예: 불안하고 스트레스가 많은 상태, 신중하게 결정하고 싶음"
              className={input}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold transition-all',
              loading
                ? 'cursor-not-allowed bg-violet-300 text-white dark:bg-violet-700/50 dark:text-violet-300'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500 active:scale-[0.99]'
            )}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" />AI가 분석 중입니다...</>
            ) : (
              <><Sparkles size={18} />AI에게 추천받기</>
            )}
          </button>
        </form>
      </main>
    </>
  );
}

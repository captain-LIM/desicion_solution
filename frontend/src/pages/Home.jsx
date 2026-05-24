import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Sparkles, Loader2, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [emotionalState, setEmotionalState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 5) setOptions([...options, '']);
  };

  const removeOption = (idx) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

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
      });
      navigate('/result', { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.error || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* 헤더 */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <Brain size={14} />
          AI 기반 의사결정 도우미
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">
          고민을 해결해드릴게요
        </h1>
        <p className="text-gray-400">
          선택지를 입력하면 AI가 최적의 결정을 추천해드립니다
        </p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 고민 상황 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <label className="mb-3 block text-sm font-semibold text-gray-300">
            고민 상황 <span className="text-violet-400">*</span>
          </label>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="어떤 것을 결정해야 하나요? 상황을 자세히 설명해주세요."
            rows={4}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        {/* 선택지 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <label className="mb-3 block text-sm font-semibold text-gray-300">
            선택지 <span className="text-violet-400">*</span>
            <span className="ml-2 text-xs text-gray-500">(최소 2개, 최대 5개)</span>
          </label>
          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">
                  {idx + 1}
                </span>
                <input
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`선택지 ${idx + 1}`}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
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
              className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-violet-300"
            >
              <Plus size={15} />
              선택지 추가
            </button>
          )}
        </div>

        {/* 감정 상태 (선택) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <label className="mb-1 block text-sm font-semibold text-gray-300">
            현재 감정 상태
            <span className="ml-2 text-xs font-normal text-gray-500">(선택사항)</span>
          </label>
          <p className="mb-3 text-xs text-gray-500">
            현재 심리 상태를 알려주시면 더 정확한 추천이 가능합니다
          </p>
          <input
            value={emotionalState}
            onChange={(e) => setEmotionalState(e.target.value)}
            placeholder="예: 불안하고 스트레스가 많은 상태, 신중하게 결정하고 싶음"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        {/* 에러 */}
        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold transition-all',
            loading
              ? 'cursor-not-allowed bg-violet-700/50 text-violet-300'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/50 active:scale-[0.99]'
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              AI가 분석 중입니다...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              AI에게 추천받기
            </>
          )}
        </button>
      </form>
    </main>
  );
}

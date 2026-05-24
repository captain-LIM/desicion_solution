import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCcw, History, Sparkles, MessageSquareText } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    navigate('/');
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* 완료 배지 */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-500/30">
          <Sparkles size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">AI 추천 결과</h1>
        <p className="mt-2 text-sm text-gray-500">{formatDate(result.created_at || new Date())}</p>
      </div>

      {/* 고민 상황 */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">고민 상황</p>
        <p className="text-gray-200">{result.scenario}</p>
        {result.emotional_state && (
          <p className="mt-3 text-sm text-gray-400">
            <span className="text-violet-400">감정 상태: </span>
            {result.emotional_state}
          </p>
        )}
      </div>

      {/* 선택지 목록 */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">입력한 선택지</p>
        <div className="space-y-2">
          {result.options.map((opt, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                opt === result.recommended_option
                  ? 'border border-violet-500/40 bg-violet-500/10'
                  : 'border border-white/5 bg-white/5'
              }`}
            >
              {opt === result.recommended_option ? (
                <CheckCircle2 size={18} className="shrink-0 text-violet-400" />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-gray-500">
                  {idx + 1}
                </span>
              )}
              <span className={opt === result.recommended_option ? 'font-semibold text-violet-200' : 'text-gray-300'}>
                {opt}
              </span>
              {opt === result.recommended_option && (
                <span className="ml-auto rounded-full bg-violet-600/30 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                  AI 추천
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI 설명 */}
      <div className="mb-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-300">AI 추천 이유</p>
        </div>
        <p className="leading-relaxed text-gray-300">{result.explanation}</p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={16} />
          다시 결정하기
        </button>
        <button
          onClick={() => navigate('/history')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500"
        >
          <History size={16} />
          히스토리 보기
        </button>
      </div>
    </main>
  );
}

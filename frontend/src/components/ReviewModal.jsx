import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

export default function ReviewModal({ decision, onClose, onSubmit }) {
  const [satisfaction, setSatisfaction] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (satisfaction === null) return;
    setLoading(true);
    try {
      await axios.patch(`/api/decisions/${decision.id}/review`, {
        satisfaction,
        review_note: note.trim() || undefined,
      });
      onSubmit(decision.id, satisfaction);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 dark:bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1a1a24]">
        {/* 헤더 */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-1 dark:text-violet-400">3일 전 결정 재검토</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">이 결정이 만족스러웠나요?</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* 고민 요약 */}
        <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
          <p className="text-xs text-gray-400 mb-1 dark:text-gray-500">당시 고민</p>
          <p className="text-sm text-gray-700 line-clamp-2 dark:text-gray-300">{decision.scenario}</p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">AI 추천 →
            <span className="ml-1 text-violet-600 font-medium dark:text-violet-300">{decision.recommended_option}</span>
          </p>
        </div>

        {/* 만족도 선택 */}
        <div className="mb-5 flex gap-3">
          <button
            onClick={() => setSatisfaction(1)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition',
              satisfaction === 1
                ? 'border-green-400 bg-green-50 text-green-600 dark:border-green-500/50 dark:bg-green-500/15 dark:text-green-400'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-green-300 hover:text-green-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-green-500/30 dark:hover:text-green-400'
            )}
          >
            <ThumbsUp size={18} />만족해요
          </button>
          <button
            onClick={() => setSatisfaction(0)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition',
              satisfaction === 0
                ? 'border-red-400 bg-red-50 text-red-600 dark:border-red-500/50 dark:bg-red-500/15 dark:text-red-400'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-red-500/30 dark:hover:text-red-400'
            )}
          >
            <ThumbsDown size={18} />아쉬워요
          </button>
        </div>

        {/* 메모 */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="결정에 대한 소감을 남겨보세요. (선택사항)"
          rows={3}
          className="mb-5 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-600 dark:focus:border-violet-500/50 dark:focus:ring-violet-500/20"
        />

        <button
          onClick={handleSubmit}
          disabled={satisfaction === null || loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition',
            satisfaction === null
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-600'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500'
          )}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : '재검토 완료'}
        </button>
      </div>
    </div>
  );
}

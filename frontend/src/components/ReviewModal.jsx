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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a24] p-6 shadow-2xl">
        {/* 헤더 */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-1">3일 전 결정 재검토</p>
            <h2 className="text-lg font-bold text-white">이 결정이 만족스러웠나요?</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* 고민 요약 */}
        <div className="mb-5 rounded-xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-gray-500 mb-1">당시 고민</p>
          <p className="text-sm text-gray-300 line-clamp-2">{decision.scenario}</p>
          <p className="mt-2 text-xs text-gray-500">AI 추천 →
            <span className="ml-1 text-violet-300 font-medium">{decision.recommended_option}</span>
          </p>
        </div>

        {/* 만족도 선택 */}
        <div className="mb-5 flex gap-3">
          <button
            onClick={() => setSatisfaction(1)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition',
              satisfaction === 1
                ? 'border-green-500/50 bg-green-500/15 text-green-400'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-green-500/30 hover:text-green-400'
            )}
          >
            <ThumbsUp size={18} />
            만족해요
          </button>
          <button
            onClick={() => setSatisfaction(0)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition',
              satisfaction === 0
                ? 'border-red-500/50 bg-red-500/15 text-red-400'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-red-500/30 hover:text-red-400'
            )}
          >
            <ThumbsDown size={18} />
            아쉬워요
          </button>
        </div>

        {/* 메모 (선택) */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="결정에 대한 소감을 남겨보세요. (선택사항)"
          rows={3}
          className="mb-5 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
        />

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={satisfaction === null || loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition',
            satisfaction === null
              ? 'cursor-not-allowed bg-white/5 text-gray-600'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500'
          )}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : '재검토 완료'}
        </button>
      </div>
    </div>
  );
}

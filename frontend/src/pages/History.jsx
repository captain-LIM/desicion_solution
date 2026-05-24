import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ChevronDown, ChevronUp, CheckCircle2, Loader2, ClockIcon, InboxIcon } from 'lucide-react';
import { formatDate } from '../lib/utils';

function HistoryCard({ item, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition hover:border-white/20">
      {/* 헤더 */}
      <div
        className="flex cursor-pointer items-start gap-4 p-5"
        onClick={() => setOpen(!open)}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 mt-0.5">
          <CheckCircle2 size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{item.scenario}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon size={11} />
            {formatDate(item.created_at)}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300">
            {item.recommended_option?.slice(0, 10)}{item.recommended_option?.length > 10 ? '...' : ''}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </div>

      {/* 상세 내용 */}
      {open && (
        <div className="border-t border-white/5 px-5 pb-5 pt-4 space-y-4">
          {/* 선택지 */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">선택지</p>
            <div className="space-y-2">
              {item.options?.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    opt === item.recommended_option
                      ? 'border border-violet-500/30 bg-violet-500/10 text-violet-200 font-medium'
                      : 'border border-white/5 bg-white/5 text-gray-400'
                  }`}
                >
                  {opt === item.recommended_option && <CheckCircle2 size={14} className="shrink-0 text-violet-400" />}
                  {opt}
                  {opt === item.recommended_option && (
                    <span className="ml-auto text-xs text-violet-400">AI 추천</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 추천 이유 */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">AI 추천 이유</p>
            <p className="text-sm leading-relaxed text-gray-300">{item.explanation}</p>
          </div>

          {item.emotional_state && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">감정 상태</p>
              <p className="text-sm text-gray-400">{item.emotional_state}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('/api/decisions/history');
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/decisions/${id}`);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">결정 히스토리</h1>
          <p className="mt-1 text-sm text-gray-500">과거에 내린 결정들을 확인하세요</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500"
        >
          + 새 결정
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-violet-400" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <InboxIcon size={40} className="mb-4 text-gray-600" />
          <p className="text-gray-400">아직 결정 기록이 없습니다</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded-xl border border-violet-500/30 px-4 py-2 text-sm text-violet-400 transition hover:bg-violet-500/10"
          >
            첫 번째 결정 해보기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, ChevronRight, X } from 'lucide-react';
import ReviewModal from './ReviewModal';

export default function ReviewBanner() {
  const [pending, setPending] = useState([]);
  const [current, setCurrent] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    axios.get('/api/decisions/pending-reviews')
      .then(({ data }) => setPending(data))
      .catch(() => {});
  }, []);

  if (dismissed || pending.length === 0) return null;

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
            <Bell size={16} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-300">
              재검토 알림 {pending.length}건
            </p>
            <p className="text-xs text-amber-400/70 truncate">
              "{pending[0].scenario}" 외 {pending.length - 1}건의 결정을 돌아볼 시간이에요
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setCurrent(pending[0])}
              className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/30"
            >
              검토하기
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-500/50 transition hover:bg-amber-500/10 hover:text-amber-400"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {current && (
        <ReviewModal
          decision={current}
          onClose={() => setCurrent(null)}
          onSubmit={(id) => {
            const remaining = pending.filter((p) => p.id !== id);
            setPending(remaining);
            setCurrent(remaining.length > 0 ? remaining[0] : null);
          }}
        />
      )}
    </>
  );
}

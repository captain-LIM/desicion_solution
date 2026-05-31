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
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
            <Bell size={16} className="text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              재검토 알림 {pending.length}건
            </p>
            <p className="text-xs text-amber-600/70 truncate dark:text-amber-400/70">
              "{pending[0].scenario}" 외 {pending.length - 1}건의 결정을 돌아볼 시간이에요
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setCurrent(pending[0])}
              className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30"
            >
              검토하기<ChevronRight size={13} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-400 transition hover:bg-amber-100 dark:hover:bg-amber-500/10"
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

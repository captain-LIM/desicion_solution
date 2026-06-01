import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Loader2, Globe, Zap, CheckCircle2 } from 'lucide-react';
import { cn, timeAgo } from '../lib/utils';
import { CATEGORIES } from '../lib/categories';

function VoteBar({ option, count, total, isAI, isMyVote, isTop, clickable, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={cn(
        'rounded-xl border px-4 py-3 transition select-none',
        clickable && 'cursor-pointer hover:border-violet-400 hover:bg-violet-50 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/10',
        isMyVote
          ? 'border-violet-400 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-500/10'
          : 'border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/5'
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={cn('text-sm leading-tight', isMyVote ? 'font-semibold text-violet-700 dark:text-violet-200' : 'text-gray-700 dark:text-gray-200')}>
          {option}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {isAI && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
              AI추천
            </span>
          )}
          {isTop && !isAI && total > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
              1위
            </span>
          )}
          {isMyVote && <CheckCircle2 size={12} className="text-violet-500 dark:text-violet-400" />}
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/10">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-700',
            isAI ? 'bg-violet-500' : isTop && total > 0 ? 'bg-blue-400' : 'bg-gray-300 dark:bg-white/20'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">{count}표</p>
    </div>
  );
}

function CommunityCard({ item }) {
  const [vs, setVs] = useState({
    vote_counts: item.vote_counts || {},
    total_votes: item.total_votes || 0,
    user_vote: item.user_vote || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cat = CATEGORIES.find((c) => c.value === item.category);
  const hasVoted = !!vs.user_vote;
  const showBars = hasVoted || vs.total_votes > 0;

  const sorted = Object.entries(vs.vote_counts).sort(([, a], [, b]) => b - a);
  const topVoted = sorted[0]?.[0] || null;
  const agree = topVoted && topVoted === item.recommended_option;
  const showComparison = vs.total_votes >= 3;

  const handleVote = async (option) => {
    if (hasVoted || loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`/api/decisions/${item.id}/vote`, { option_text: option });
      setVs({ vote_counts: data.vote_counts, total_votes: data.total_votes, user_vote: data.user_vote });
    } catch (err) {
      setError(err.response?.data?.error || '투표 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {cat ? `${cat.emoji} ${cat.label}` : '💬 기타'}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(item.created_at)}</span>
      </div>

      {/* Scenario */}
      <p className="mb-4 line-clamp-2 text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-100">
        {item.scenario}
      </p>

      {/* Vote UI */}
      {showBars ? (
        <div className="space-y-2">
          {item.options.map((opt) => (
            <VoteBar
              key={opt}
              option={opt}
              count={vs.vote_counts[opt] || 0}
              total={vs.total_votes}
              isAI={opt === item.recommended_option}
              isMyVote={opt === vs.user_vote}
              isTop={opt === topVoted && vs.total_votes > 0}
              clickable={!hasVoted && !loading}
              onClick={() => handleVote(opt)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {item.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleVote(opt)}
              disabled={loading}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
            >
              <span>{opt}</span>
              {opt === item.recommended_option && (
                <span className="ml-2 shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                  AI추천
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {vs.total_votes > 0 ? `👥 ${vs.total_votes}명 참여` : '✨ 첫 번째로 투표해보세요'}
        </span>
        {showComparison && (
          <span className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
            agree
              ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
              : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
          )}>
            {agree
              ? <><CheckCircle2 size={10} />AI ≡ 사람들</>
              : <><Zap size={10} />AI vs 사람들</>
            }
          </span>
        )}
      </div>
    </div>
  );
}

export default function Community() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/decisions/community')
      .then(({ data }) => setFeed(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={32} className="animate-spin text-violet-500" />
    </div>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* 헤더 */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-50 px-4 py-1.5 text-sm text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          <Users size={14} />익명 커뮤니티 투표
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          사람들은 어떻게 선택했을까?
        </h1>
        <p className="text-gray-500 dark:text-gray-400">AI의 추천과 사람들의 선택을 비교해보세요</p>
      </div>

      {/* 범례 */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-500" />AI 추천
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-400" />사람들의 1위
        </span>
        <span className="flex items-center gap-1.5 text-orange-400">
          <Zap size={10} />AI vs 사람들 충돌
        </span>
        <span className="flex items-center gap-1.5 text-green-500">
          <CheckCircle2 size={10} />일치
        </span>
      </div>

      {feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Globe size={40} className="mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">아직 공개된 결정이 없어요</p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            결과 페이지에서 결정을 공개하면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((item) => (
            <CommunityCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}

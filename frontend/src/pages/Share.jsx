import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Sparkles, MessageSquareText, Loader2, BrainCircuit, Link2, Check, TrendingUp, Target, Heart, Layers, Users, Zap } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Share() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voteState, setVoteState] = useState(null);

  useEffect(() => {
    axios.get(`/api/decisions/${id}`)
      .then(({ data }) => {
        setResult(data);
        if (data.is_public) {
          axios.get(`/api/decisions/${id}/votes`)
            .then(({ data: vd }) => setVoteState(vd))
            .catch(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async (option) => {
    if (!user || voteState?.user_vote || voteState?.is_owner) return;
    try {
      const { data } = await axios.post(`/api/decisions/${id}/vote`, { option_text: option });
      setVoteState((prev) => ({ ...prev, ...data }));
    } catch (err) { console.error(err); }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={32} className="animate-spin text-violet-500" />
    </div>
  );

  if (notFound) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">결정을 찾을 수 없습니다</p>
      <p className="text-gray-500">삭제됐거나 잘못된 링크입니다.</p>
      <button onClick={() => navigate('/')}
        className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500">
        홈으로 가기
      </button>
    </div>
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300 bg-violet-50 px-4 py-1.5 text-sm text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
          <BrainCircuit size={14} />DecideAI가 추천한 결정
        </div>
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-500/30">
          <Sparkles size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI 추천 결과</h1>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{formatDate(result.created_at)}</p>
      </div>

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">고민 상황</p>
        <p className="text-gray-700 dark:text-gray-200">{result.scenario}</p>
        {result.emotional_state && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-violet-600 dark:text-violet-400">감정 상태: </span>{result.emotional_state}
          </p>
        )}
      </div>

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">선택지</p>
        <div className="space-y-2">
          {result.options.map((opt, idx) => (
            <div key={idx} className={cn('flex items-center gap-3 rounded-xl px-4 py-3',
              opt === result.recommended_option
                ? 'border border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10'
                : 'border border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/5'
            )}>
              {opt === result.recommended_option
                ? <CheckCircle2 size={18} className="shrink-0 text-violet-600 dark:text-violet-400" />
                : <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-400 dark:border-white/20 dark:text-gray-500">{idx + 1}</span>
              }
              <span className={opt === result.recommended_option ? 'font-semibold text-violet-700 dark:text-violet-200' : 'text-gray-600 dark:text-gray-300'}>{opt}</span>
              {opt === result.recommended_option && (
                <span className="ml-auto rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-600/30 dark:text-violet-300">AI 추천</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={cn('rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-500/30 dark:bg-violet-950/40', result.perspectives ? 'mb-4' : 'mb-8')}>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText size={16} className="text-violet-600 dark:text-violet-400" />
          <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI 종합 추천</p>
        </div>
        <p className="leading-relaxed text-gray-700 dark:text-gray-100">{result.explanation}</p>
      </div>

      {result.perspectives && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Layers size={15} className="text-gray-400 dark:text-gray-500" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">3가지 관점 분석</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-500/25 dark:bg-green-950/30">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                  <TrendingUp size={13} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">낙관론자의 시각</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-100">{result.perspectives.optimist}</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/25 dark:bg-blue-950/30">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                  <Target size={13} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">현실주의자의 시각</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-100">{result.perspectives.realist}</p>
            </div>
            <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5 dark:border-pink-500/25 dark:bg-pink-950/30">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-500/20">
                  <Heart size={13} className="text-pink-600 dark:text-pink-400" />
                </div>
                <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">감성적 시각</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-100">{result.perspectives.emotional}</p>
            </div>
          </div>
        </div>
      )}

      {/* 커뮤니티 투표 */}
      {!!result.is_public && voteState && (
        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-500/30 dark:bg-blue-950/30">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">사람들의 선택</p>
            </div>
            <span className="text-xs text-blue-500/70 dark:text-blue-400/50">{voteState.total_votes}명 참여</span>
          </div>

          {/* AI vs People 비교 */}
          {voteState.total_votes >= 3 && (() => {
            const topVoted = Object.entries(voteState.vote_counts).sort(([, a], [, b]) => b - a)[0]?.[0];
            const agree = topVoted === result.recommended_option;
            return (
              <div className={cn('mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium',
                agree ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
              )}>
                {agree ? <CheckCircle2 size={13} /> : <Zap size={13} />}
                {agree
                  ? 'AI와 사람들의 선택이 일치해요!'
                  : `AI: "${result.recommended_option}" 추천 / 사람들: "${topVoted}" 선택`
                }
              </div>
            );
          })()}

          {/* 옵션 바 */}
          <div className="space-y-2">
            {result.options.map((opt) => {
              const count = voteState.vote_counts[opt] || 0;
              const pct = voteState.total_votes > 0 ? Math.round((count / voteState.total_votes) * 100) : 0;
              const isAI = opt === result.recommended_option;
              const isMyVote = opt === voteState.user_vote;
              const topVoted = Object.entries(voteState.vote_counts).sort(([, a], [, b]) => b - a)[0]?.[0];
              const isTop = opt === topVoted && voteState.total_votes > 0;
              const canVote = !voteState.user_vote && !voteState.is_owner && !!user;
              return (
                <div
                  key={opt}
                  onClick={canVote ? () => handleVote(opt) : undefined}
                  className={cn(
                    'rounded-xl border px-4 py-3 transition',
                    canVote && 'cursor-pointer hover:border-blue-400 hover:bg-blue-100 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/20',
                    isMyVote ? 'border-blue-400 bg-blue-100 dark:border-blue-500/50 dark:bg-blue-500/20'
                             : 'border-blue-100 bg-white dark:border-blue-500/10 dark:bg-blue-950/20'
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={cn('text-sm', isMyVote ? 'font-semibold text-blue-700 dark:text-blue-200' : 'text-gray-700 dark:text-gray-200')}>{opt}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {isAI && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">AI추천</span>}
                      {isTop && !isAI && voteState.total_votes > 0 && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">1위</span>}
                      {isMyVote && <CheckCircle2 size={12} className="text-blue-500" />}
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/10">
                    <div className={cn('h-1.5 rounded-full transition-all duration-700',
                      isAI ? 'bg-violet-500' : isTop && voteState.total_votes > 0 ? 'bg-blue-400' : 'bg-gray-200 dark:bg-white/20'
                    )} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">{count}표</p>
                </div>
              );
            })}
          </div>

          {!voteState.user_vote && voteState.is_owner && (
            <p className="mt-3 text-center text-xs text-blue-500/60 dark:text-blue-400/50">자신의 결정에는 투표할 수 없어요</p>
          )}
          {!voteState.user_vote && !voteState.is_owner && !user && (
            <p className="mt-3 text-center text-xs text-blue-500/60 dark:text-blue-400/50">투표하려면 로그인이 필요합니다</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleCopyLink}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
          {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
          {copied ? '복사됨!' : '링크 복사'}
        </button>
        <button onClick={() => navigate('/')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500">
          <BrainCircuit size={16} />나도 결정해보기
        </button>
      </div>
    </main>
  );
}

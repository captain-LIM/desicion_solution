import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCcw, History, Sparkles, MessageSquareText, Link2, Copy, Share2, Check, Bookmark, BookmarkCheck, Fingerprint, TrendingUp, Target, Heart, Layers, Globe, Users } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { useState } from 'react';
import axios from 'axios';

function ShareButtons({ result }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const shareUrl = `${window.location.origin}/share/${result.id}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = async () => {
    const text = `[DecideAI 결정 결과]\n\n고민: ${result.scenario}\n\nAI 추천: ${result.recommended_option}\n\n이유: ${result.explanation}\n\n${shareUrl}`;
    await navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'DecideAI 결정 결과', text: `AI가 추천한 선택: ${result.recommended_option}`, url: shareUrl });
    }
  };

  const btn = 'flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white';

  return (
    <>
      <button onClick={handleCopyLink} className={btn}>
        {copiedLink ? <Check size={15} className="text-green-500" /> : <Link2 size={15} />}
        {copiedLink ? '링크 복사됨!' : '링크 복사'}
      </button>
      <button onClick={handleCopyText} className={btn}>
        {copiedText ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
        {copiedText ? '텍스트 복사됨!' : '텍스트 복사'}
      </button>
      {navigator.share && (
        <button onClick={handleNativeShare} className="flex items-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm text-violet-600 transition hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-600/20 dark:text-violet-300 dark:hover:bg-violet-600/30">
          <Share2 size={15} />공유하기
        </button>
      )}
    </>
  );
}

function BookmarkButton({ result }) {
  const [bookmarked, setBookmarked] = useState(!!result.is_bookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const { data } = await axios.patch(`/api/decisions/${result.id}/bookmark`);
      setBookmarked(!!data.is_bookmarked);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition',
        bookmarked
          ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/20'
          : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-amber-300'
      )}
    >
      {bookmarked ? <BookmarkCheck size={15} className="text-amber-500 dark:text-amber-400" /> : <Bookmark size={15} />}
      {bookmarked ? '북마크됨' : '북마크'}
    </button>
  );
}

function PublishToggle({ decisionId }) {
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const { data } = await axios.patch(`/api/decisions/${decisionId}/publish`);
      setIsPublic(!!data.is_public);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
          isPublic ? 'bg-blue-100 dark:bg-blue-500/10' : 'bg-gray-100 dark:bg-white/10'
        )}>
          {isPublic ? <Users size={18} className="text-blue-600 dark:text-blue-400" /> : <Globe size={18} className="text-gray-400 dark:text-gray-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">커뮤니티 공개 투표</p>
          <p className="truncate text-xs text-gray-400 dark:text-gray-500">
            {isPublic ? '다른 사람들이 투표할 수 있어요' : '공개하면 커뮤니티에서 투표받을 수 있어요'}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
            isPublic ? 'bg-blue-500' : 'bg-gray-200 dark:bg-white/20',
            loading && 'cursor-not-allowed opacity-60'
          )}
        >
          <span className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            isPublic ? 'translate-x-5' : 'translate-x-0'
          )} />
        </button>
      </div>
      {isPublic && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
          <span className="text-xs text-blue-600 dark:text-blue-300">✓ 커뮤니티 피드에 공개됐어요</span>
          <button onClick={() => navigate('/community')}
            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300">
            커뮤니티 보기 →
          </button>
        </div>
      )}
    </div>
  );
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) { navigate('/'); return null; }

  const card = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5';

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-500/30">
          <Sparkles size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI 추천 결과</h1>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{formatDate(result.created_at || new Date())}</p>
      </div>

      {/* 고민 상황 */}
      <div className={cn(card, 'mb-5')}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">고민 상황</p>
        <p className="text-gray-700 dark:text-gray-200">{result.scenario}</p>
        {result.emotional_state && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-violet-600 dark:text-violet-400">감정 상태: </span>{result.emotional_state}
          </p>
        )}
      </div>

      {/* 선택지 */}
      <div className={cn(card, 'mb-5')}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">입력한 선택지</p>
        <div className="space-y-2">
          {result.options.map((opt, idx) => (
            <div key={idx} className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 transition',
              opt === result.recommended_option
                ? 'border border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10'
                : 'border border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/5'
            )}>
              {opt === result.recommended_option ? (
                <CheckCircle2 size={18} className="shrink-0 text-violet-600 dark:text-violet-400" />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-400 dark:border-white/20 dark:text-gray-500">{idx + 1}</span>
              )}
              <span className={opt === result.recommended_option ? 'font-semibold text-violet-700 dark:text-violet-200' : 'text-gray-600 dark:text-gray-300'}>
                {opt}
              </span>
              {opt === result.recommended_option && (
                <span className="ml-auto rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-600/30 dark:text-violet-300">AI 추천</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI 종합 추천 */}
      <div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-500/30 dark:bg-violet-950/40">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText size={16} className="text-violet-600 dark:text-violet-400" />
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI 종합 추천</p>
          </div>
          {result.is_personalized && (
            <div className="flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/20 dark:text-violet-300">
              <Fingerprint size={12} />
              개인화 AI
            </div>
          )}
        </div>
        <p className="leading-relaxed text-gray-700 dark:text-gray-100">{result.explanation}</p>
        {result.is_personalized && (
          <p className="mt-3 text-xs text-violet-600/70 dark:text-violet-400/70">
            ✦ 나의 과거 결정 패턴을 분석하여 맞춤 추천했습니다.
          </p>
        )}
      </div>

      {/* 멀티 관점 분석 */}
      {result.perspectives && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Layers size={15} className="text-gray-400 dark:text-gray-500" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">3가지 관점 분석</p>
          </div>
          <div className="space-y-3">
            {/* 낙관론자 */}
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-500/25 dark:bg-green-950/30">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                  <TrendingUp size={13} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">낙관론자의 시각</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-100">{result.perspectives.optimist}</p>
            </div>
            {/* 현실주의자 */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/25 dark:bg-blue-950/30">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                  <Target size={13} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">현실주의자의 시각</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-100">{result.perspectives.realist}</p>
            </div>
            {/* 감성적 */}
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

      {/* 커뮤니티 공개 투표 토글 */}
      <PublishToggle decisionId={result.id} />

      {/* 공유 + 북마크 */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 flex items-center gap-2">
          <Share2 size={15} className="text-gray-400" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">저장 및 공유</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BookmarkButton result={result} />
          <ShareButtons result={result} />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <RotateCcw size={16} />다시 결정하기
        </button>
        <button
          onClick={() => navigate('/history')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500"
        >
          <History size={16} />히스토리 보기
        </button>
      </div>
    </main>
  );
}

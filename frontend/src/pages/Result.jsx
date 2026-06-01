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

  const btn = 'flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.07] dark:hover:text-white';

  return (
    <>
      <button onClick={handleCopyLink} className={btn}>
        {copiedLink ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
        {copiedLink ? '복사됨!' : '링크 복사'}
      </button>
      <button onClick={handleCopyText} className={btn}>
        {copiedText ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        {copiedText ? '복사됨!' : '텍스트 복사'}
      </button>
      {navigator.share && (
        <button onClick={handleNativeShare} className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3.5 py-2 text-sm text-violet-600 transition hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-600/[0.12] dark:text-violet-300 dark:hover:bg-violet-600/20">
          <Share2 size={14} />공유하기
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
        'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition',
        bookmarked
          ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
          : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-400 dark:hover:text-amber-300'
      )}
    >
      {bookmarked ? <BookmarkCheck size={14} className="text-amber-500 dark:text-amber-400" /> : <Bookmark size={14} />}
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
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#16161f]">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition',
          isPublic ? 'bg-blue-100 dark:bg-blue-500/10' : 'bg-gray-100 dark:bg-white/10'
        )}>
          {isPublic ? <Users size={17} className="text-blue-600 dark:text-blue-400" /> : <Globe size={17} className="text-gray-400 dark:text-gray-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">커뮤니티 공개 투표</p>
          <p className="truncate text-xs text-gray-400">
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
        <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2 dark:border-blue-500/20 dark:bg-blue-500/10">
          <span className="text-xs text-blue-600 dark:text-blue-300">커뮤니티 피드에 공개됐어요</span>
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

  const card = 'rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#16161f]';
  const sectionLabel = 'mb-2 text-xs font-medium text-gray-400 dark:text-gray-500';

  return (
    <main className="mx-auto max-w-xl px-5 py-8">
      <div className="mb-7 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600">
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 추천 결과</h1>
          <p className="mt-0.5 text-sm text-gray-400">{formatDate(result.created_at || new Date())}</p>
        </div>
      </div>

      {/* 고민 상황 */}
      <div className={cn(card, 'mb-3')}>
        <p className={sectionLabel}>고민 상황</p>
        <p className="text-sm text-gray-700 dark:text-gray-200">{result.scenario}</p>
        {result.emotional_state && (
          <p className="mt-2.5 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-violet-600 dark:text-violet-400">감정 상태: </span>{result.emotional_state}
          </p>
        )}
      </div>

      {/* 선택지 */}
      <div className={cn(card, 'mb-3')}>
        <p className={sectionLabel}>입력한 선택지</p>
        <div className="space-y-2">
          {result.options.map((opt, idx) => (
            <div key={idx} className={cn(
              'flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm',
              opt === result.recommended_option
                ? 'border border-violet-200 bg-violet-50 dark:border-violet-500/30 dark:bg-violet-500/[0.08]'
                : 'border border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.03]'
            )}>
              {opt === result.recommended_option ? (
                <CheckCircle2 size={15} className="shrink-0 text-violet-600 dark:text-violet-400" />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-400 dark:border-white/20">{idx + 1}</span>
              )}
              <span className={opt === result.recommended_option ? 'font-medium text-violet-700 dark:text-violet-200' : 'text-gray-600 dark:text-gray-300'}>
                {opt}
              </span>
              {opt === result.recommended_option && (
                <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-600/20 dark:text-violet-300">추천</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI 종합 추천 */}
      <div className="mb-3 rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-500/25 dark:bg-violet-950/40">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText size={15} className="text-violet-600 dark:text-violet-400" />
            <p className="text-sm font-medium text-violet-700 dark:text-violet-300">AI 종합 추천</p>
          </div>
          {result.is_personalized && (
            <div className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300">
              <Fingerprint size={11} />개인화
            </div>
          )}
        </div>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-100">{result.explanation}</p>
      </div>

      {/* 멀티 관점 분석 */}
      {result.perspectives && (
        <div className="mb-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Layers size={14} className="text-gray-400" />
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">3가지 관점 분석</p>
          </div>
          <div className="space-y-2">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-950/25">
              <div className="mb-1.5 flex items-center gap-1.5">
                <TrendingUp size={12} className="text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">낙관론자</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{result.perspectives.optimist}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-950/25">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Target size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">현실주의자</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{result.perspectives.realist}</p>
            </div>
            <div className="rounded-xl border border-pink-200 bg-pink-50 p-4 dark:border-pink-500/20 dark:bg-pink-950/25">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Heart size={12} className="text-pink-600 dark:text-pink-400" />
                <span className="text-xs font-medium text-pink-700 dark:text-pink-300">감성적 시각</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{result.perspectives.emotional}</p>
            </div>
          </div>
        </div>
      )}

      {/* 커뮤니티 공개 투표 */}
      <PublishToggle decisionId={result.id} />

      {/* 저장 및 공유 */}
      <div className={cn(card, 'mb-5')}>
        <p className={cn(sectionLabel, 'flex items-center gap-1.5')}><Share2 size={12} />저장 및 공유</p>
        <div className="flex flex-wrap gap-2">
          <BookmarkButton result={result} />
          <ShareButtons result={result} />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-2.5">
        <button
          onClick={() => navigate('/')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
        >
          <RotateCcw size={15} />다시 결정하기
        </button>
        <button
          onClick={() => navigate('/history')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-medium text-white transition hover:bg-violet-700 dark:hover:bg-violet-500"
        >
          <History size={15} />히스토리 보기
        </button>
      </div>
    </main>
  );
}

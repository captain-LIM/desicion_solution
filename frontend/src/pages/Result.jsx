import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCcw, History, Sparkles, MessageSquareText, Link2, Copy, Share2, Check, Bookmark, BookmarkCheck } from 'lucide-react';
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

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) { navigate('/'); return null; }

  const card = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5';

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
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

      {/* AI 설명 */}
      <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-500/20 dark:bg-gradient-to-br dark:from-violet-500/10 dark:to-purple-500/5">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText size={16} className="text-violet-600 dark:text-violet-400" />
          <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI 추천 이유</p>
        </div>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">{result.explanation}</p>
      </div>

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

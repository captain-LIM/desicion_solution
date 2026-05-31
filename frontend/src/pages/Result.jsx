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
      await navigator.share({
        title: 'DecideAI 결정 결과',
        text: `AI가 추천한 선택: ${result.recommended_option}`,
        url: shareUrl,
      });
    }
  };

  return (
    <>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
      >
        {copiedLink ? <Check size={15} className="text-green-400" /> : <Link2 size={15} />}
        {copiedLink ? '링크 복사됨!' : '링크 복사'}
      </button>
      <button
        onClick={handleCopyText}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
      >
        {copiedText ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
        {copiedText ? '텍스트 복사됨!' : '텍스트 복사'}
      </button>
      {navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 rounded-xl bg-violet-600/20 border border-violet-500/30 px-4 py-2.5 text-sm text-violet-300 transition hover:bg-violet-600/30"
        >
          <Share2 size={15} />
          공유하기
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
          ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/20'
          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-amber-300'
      )}
    >
      {bookmarked ? <BookmarkCheck size={15} className="text-amber-400" /> : <Bookmark size={15} />}
      {bookmarked ? '북마크됨' : '북마크'}
    </button>
  );
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    navigate('/');
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-500/30">
          <Sparkles size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">AI 추천 결과</h1>
        <p className="mt-2 text-sm text-gray-500">{formatDate(result.created_at || new Date())}</p>
      </div>

      {/* 고민 상황 */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">고민 상황</p>
        <p className="text-gray-200">{result.scenario}</p>
        {result.emotional_state && (
          <p className="mt-3 text-sm text-gray-400">
            <span className="text-violet-400">감정 상태: </span>
            {result.emotional_state}
          </p>
        )}
      </div>

      {/* 선택지 */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">입력한 선택지</p>
        <div className="space-y-2">
          {result.options.map((opt, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                opt === result.recommended_option
                  ? 'border border-violet-500/40 bg-violet-500/10'
                  : 'border border-white/5 bg-white/5'
              }`}
            >
              {opt === result.recommended_option ? (
                <CheckCircle2 size={18} className="shrink-0 text-violet-400" />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-gray-500">
                  {idx + 1}
                </span>
              )}
              <span className={opt === result.recommended_option ? 'font-semibold text-violet-200' : 'text-gray-300'}>
                {opt}
              </span>
              {opt === result.recommended_option && (
                <span className="ml-auto rounded-full bg-violet-600/30 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                  AI 추천
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI 설명 */}
      <div className="mb-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-300">AI 추천 이유</p>
        </div>
        <p className="leading-relaxed text-gray-300">{result.explanation}</p>
      </div>

      {/* 공유 + 북마크 버튼 */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Share2 size={15} className="text-gray-400" />
          <p className="text-sm font-semibold text-gray-300">저장 및 공유</p>
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
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={16} />
          다시 결정하기
        </button>
        <button
          onClick={() => navigate('/history')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500"
        >
          <History size={16} />
          히스토리 보기
        </button>
      </div>
    </main>
  );
}

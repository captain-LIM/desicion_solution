import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Sparkles, MessageSquareText, Loader2, BrainCircuit, Link2, Check } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function Share() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`/api/decisions/${id}`)
      .then(({ data }) => setResult(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-2xl font-bold text-white">결정을 찾을 수 없습니다</p>
        <p className="text-gray-500">삭제됐거나 잘못된 링크입니다.</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
        >
          홈으로 가기
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* 공유 배지 */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <BrainCircuit size={14} />
          DecideAI가 추천한 결정
        </div>
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-500/30">
          <Sparkles size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">AI 추천 결과</h1>
        <p className="mt-2 text-sm text-gray-500">{formatDate(result.created_at)}</p>
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
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">선택지</p>
        <div className="space-y-2">
          {result.options.map((opt, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
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
      <div className="mb-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText size={16} className="text-violet-400" />
          <p className="text-sm font-semibold text-violet-300">AI 추천 이유</p>
        </div>
        <p className="leading-relaxed text-gray-300">{result.explanation}</p>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={handleCopyLink}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Link2 size={16} />}
          {copied ? '복사됨!' : '링크 복사'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500"
        >
          <BrainCircuit size={16} />
          나도 결정해보기
        </button>
      </div>
    </main>
  );
}

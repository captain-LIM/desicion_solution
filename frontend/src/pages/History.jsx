import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Trash2, ChevronDown, ChevronUp, CheckCircle2, Loader2,
  ClockIcon, InboxIcon, ThumbsUp, ThumbsDown, RotateCcw,
  Bookmark, BookmarkCheck, Search, X, SlidersHorizontal,
  TrendingUp, Target, Heart, Layers,
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { CATEGORIES } from '../lib/categories';
import ReviewModal from '../components/ReviewModal';

function HistoryCard({ item, onDelete, onReviewed, onBookmarkToggle }) {
  const [open, setOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const isOldEnough = (new Date() - new Date(item.created_at)) >= 3 * 24 * 60 * 60 * 1000;
  const needsReview = isOldEnough && item.satisfaction === null;
  const cat = CATEGORIES.find((c) => c.value === item.category);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    setBookmarkLoading(true);
    try {
      const { data } = await axios.patch(`/api/decisions/${item.id}/bookmark`);
      onBookmarkToggle(item.id, data.is_bookmarked);
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20">
        <div className="flex cursor-pointer items-start gap-4 p-5" onClick={() => setOpen(!open)}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 mt-0.5 dark:bg-violet-600/20 dark:text-violet-400">
            {item.satisfaction === 1 ? <ThumbsUp size={16} className="text-green-500 dark:text-green-400" />
              : item.satisfaction === 0 ? <ThumbsDown size={16} className="text-red-500 dark:text-red-400" />
              : <CheckCircle2 size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            {cat && <p className="text-xs text-gray-400 mb-0.5 dark:text-gray-500">{cat.emoji} {cat.label}</p>}
            <p className="font-medium text-gray-900 truncate dark:text-white">{item.scenario}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <ClockIcon size={11} />{formatDate(item.created_at)}
              {item.satisfaction === 1 && <span className="text-green-500">· 만족</span>}
              {item.satisfaction === 0 && <span className="text-red-500">· 아쉬움</span>}
              {needsReview && <span className="text-amber-500 dark:text-amber-400">· 재검토 필요</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
              {item.recommended_option?.slice(0, 10)}{item.recommended_option?.length > 10 ? '...' : ''}
            </span>
            <button onClick={handleBookmark} disabled={bookmarkLoading}
              className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition',
                item.is_bookmarked
                  ? 'text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10'
                  : 'text-gray-300 hover:bg-gray-50 hover:text-amber-500 dark:text-gray-600 dark:hover:bg-white/5 dark:hover:text-amber-400'
              )}>
              {item.is_bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-500/10 dark:hover:text-red-400">
              <Trash2 size={14} />
            </button>
            {open ? <ChevronUp size={16} className="text-gray-400 dark:text-gray-500" /> : <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />}
          </div>
        </div>

        {open && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4 dark:border-white/5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">선택지</p>
              <div className="space-y-2">
                {item.options?.map((opt, idx) => (
                  <div key={idx} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    opt === item.recommended_option
                      ? 'border border-violet-200 bg-violet-50 text-violet-700 font-medium dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200'
                      : 'border border-gray-100 bg-gray-50 text-gray-600 dark:border-white/5 dark:bg-white/5 dark:text-gray-400'
                  )}>
                    {opt === item.recommended_option && <CheckCircle2 size={14} className="shrink-0 text-violet-600 dark:text-violet-400" />}
                    {opt}
                    {opt === item.recommended_option && <span className="ml-auto text-xs text-violet-500 dark:text-violet-400">AI 추천</span>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">AI 종합 추천</p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-100">{item.explanation}</p>
            </div>
            {item.perspectives && (
              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <Layers size={12} className="text-gray-400 dark:text-gray-500" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">3가지 관점</p>
                </div>
                <div className="space-y-2">
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-500/20 dark:bg-green-950/20">
                    <div className="mb-1 flex items-center gap-1.5">
                      <TrendingUp size={11} className="text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300">낙관론자</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-100">{item.perspectives.optimist}</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-950/20">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Target size={11} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">현실주의자</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-100">{item.perspectives.realist}</p>
                  </div>
                  <div className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 dark:border-pink-500/20 dark:bg-pink-950/20">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Heart size={11} className="text-pink-600 dark:text-pink-400" />
                      <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">감성적</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-100">{item.perspectives.emotional}</p>
                  </div>
                </div>
              </div>
            )}
            {item.emotional_state && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">감정 상태</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.emotional_state}</p>
              </div>
            )}
            {item.review_note && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">재검토 메모</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.review_note}</p>
              </div>
            )}
            {needsReview && (
              <button onClick={(e) => { e.stopPropagation(); setShowReview(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-medium text-amber-600 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20">
                <RotateCcw size={14} />이 결정 재검토하기
              </button>
            )}
            {item.satisfaction !== null && (
              <button onClick={(e) => { e.stopPropagation(); setShowReview(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm text-gray-400 transition hover:text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-500 dark:hover:text-gray-300">
                <RotateCcw size={14} />재검토 다시 하기
              </button>
            )}
          </div>
        )}
      </div>

      {showReview && (
        <ReviewModal decision={item} onClose={() => setShowReview(false)} onSubmit={(id, satisfaction) => onReviewed(id, satisfaction)} />
      )}
    </>
  );
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const { data } = await axios.get('/api/decisions/history', { params });
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategory, dateFrom, dateTo]);

  useEffect(() => {
    const timer = setTimeout(fetchHistory, 300);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/decisions/${id}`);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleReviewed = (id, satisfaction) =>
    setHistory((prev) => prev.map((h) => h.id === id ? { ...h, satisfaction } : h));

  const handleBookmarkToggle = (id, is_bookmarked) =>
    setHistory((prev) => prev.map((h) => h.id === id ? { ...h, is_bookmarked } : h));

  const clearFilters = () => { setKeyword(''); setSelectedCategory(''); setDateFrom(''); setDateTo(''); };

  const hasActiveFilters = keyword || selectedCategory || dateFrom || dateTo;
  const filtered = filter === 'bookmarked' ? history.filter((h) => h.is_bookmarked) : history;
  const bookmarkCount = history.filter((h) => h.is_bookmarked).length;

  const inputCls = 'rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-violet-500/50 dark:focus:ring-violet-500/20';

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">결정 히스토리</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">과거에 내린 결정들을 확인하세요</p>
        </div>
        <button onClick={() => navigate('/')}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500">
          + 새 결정
        </button>
      </div>

      {/* 검색창 */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="키워드로 검색..."
            className={cn(inputCls, 'w-full py-2.5 pl-9 pr-4')} />
          {keyword && (
            <button onClick={() => setKeyword('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={cn('flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition',
            showFilters || hasActiveFilters
              ? 'border-violet-300 bg-violet-50 text-violet-600 dark:border-violet-500/50 dark:bg-violet-500/15 dark:text-violet-300'
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
          )}>
          <SlidersHorizontal size={15} />필터
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] text-white dark:bg-violet-500">
              {[keyword, selectedCategory, dateFrom, dateTo].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 space-y-4 dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} onClick={() => setSelectedCategory(selectedCategory === cat.value ? '' : cat.value)}
                  className={cn('flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition',
                    selectedCategory === cat.value
                      ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-200'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20'
                  )}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">날짜 범위</p>
            <div className="flex items-center gap-3">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className={cn(inputCls, 'flex-1 px-3 py-2 [color-scheme:light] dark:[color-scheme:dark]')} />
              <span className="text-gray-400 text-sm dark:text-gray-500">~</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className={cn(inputCls, 'flex-1 px-3 py-2 [color-scheme:light] dark:[color-scheme:dark]')} />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition dark:text-gray-500 dark:hover:text-red-400">
              <X size={12} />필터 초기화
            </button>
          )}
        </div>
      )}

      {/* 탭 */}
      {!loading && history.length > 0 && (
        <div className="mb-5 flex gap-2">
          <button onClick={() => setFilter('all')}
            className={cn('rounded-xl px-4 py-2 text-sm font-medium transition',
              filter === 'all'
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-600/20 dark:text-violet-300'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300'
            )}>
            전체 {history.length}
          </button>
          <button onClick={() => setFilter('bookmarked')}
            className={cn('flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition',
              filter === 'bookmarked'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300'
            )}>
            <BookmarkCheck size={14} />북마크 {bookmarkCount}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-violet-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <InboxIcon size={40} className="mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            {hasActiveFilters ? '검색 결과가 없습니다'
              : filter === 'bookmarked' ? '북마크된 결정이 없습니다'
              : '아직 결정 기록이 없습니다'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="mt-4 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:text-white">
              필터 초기화
            </button>
          ) : filter === 'all' && (
            <button onClick={() => navigate('/')} className="mt-4 rounded-xl border border-violet-300 px-4 py-2 text-sm text-violet-600 transition hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-400 dark:hover:bg-violet-500/10">
              첫 번째 결정 해보기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <HistoryCard key={item.id} item={item} onDelete={handleDelete} onReviewed={handleReviewed} onBookmarkToggle={handleBookmarkToggle} />
          ))}
        </div>
      )}
    </main>
  );
}

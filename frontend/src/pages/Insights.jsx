import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Loader2, Search, Zap, Heart, Cpu, RefreshCw, SlidersHorizontal,
  Clock, Star, Brain, TrendingUp, Activity, Lightbulb, CheckCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CATEGORIES } from '../lib/categories';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const TRAIT_ICONS = {
  search: Search,
  zap: Zap,
  heart: Heart,
  cpu: Cpu,
  refresh: RefreshCw,
  sliders: SlidersHorizontal,
};

const TRAIT_COLORS = {
  careful: { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30', text: 'text-blue-700 dark:text-blue-300', icon: 'text-blue-500 dark:text-blue-400' },
  decisive: { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30', text: 'text-orange-700 dark:text-orange-300', icon: 'text-orange-500 dark:text-orange-400' },
  emotional: { bg: 'bg-pink-50 dark:bg-pink-500/10', border: 'border-pink-200 dark:border-pink-500/30', text: 'text-pink-700 dark:text-pink-300', icon: 'text-pink-500 dark:text-pink-400' },
  rational: { bg: 'bg-teal-50 dark:bg-teal-500/10', border: 'border-teal-200 dark:border-teal-500/30', text: 'text-teal-700 dark:text-teal-300', icon: 'text-teal-500 dark:text-teal-400' },
  reflective: { bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/30', text: 'text-violet-700 dark:text-violet-300', icon: 'text-violet-500 dark:text-violet-400' },
  balanced: { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/30', text: 'text-green-700 dark:text-green-300', icon: 'text-green-500 dark:text-green-400' },
};

function MiniBar({ value, max, color = 'bg-violet-500' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10">
      <div className={cn('h-2 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent = 'violet' }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <div className={cn('mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl', colors[accent])}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

const HOUR_LABELS = ['새벽', '오전', '낮', '오후', '저녁', '밤'];
function hourLabel(h) {
  if (h >= 0 && h < 6) return '새벽';
  if (h >= 6 && h < 10) return '오전';
  if (h >= 10 && h < 14) return '낮';
  if (h >= 14 && h < 18) return '오후';
  if (h >= 18 && h < 22) return '저녁';
  return '밤';
}

function getCategoryEmoji(name) {
  const found = CATEGORIES.find((c) => c.value === name || c.label === name);
  return found ? found.emoji : '💬';
}

export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/decisions/insights')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={32} className="animate-spin text-violet-500" />
    </div>
  );

  if (!data || data.total === 0) return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/10">
        <Brain size={32} className="text-violet-500" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">아직 데이터가 없어요</h2>
      <p className="text-gray-500 dark:text-gray-400">결정을 몇 번 해보면 나만의 의사결정 성향을 분석해드릴게요.</p>
    </main>
  );

  // 시간대별 집계
  const hourGroups = { 새벽: 0, 오전: 0, 낮: 0, 오후: 0, 저녁: 0, 밤: 0 };
  (data.hour_distribution || []).forEach(({ hour, count }) => {
    hourGroups[hourLabel(hour)] += count;
  });
  const hourChartData = HOUR_LABELS.map((label) => ({ label, count: hourGroups[label] }));
  const maxHourCount = Math.max(...hourChartData.map((d) => d.count));
  const peakPeriod = maxHourCount > 0 ? hourChartData.find((d) => d.count === maxHourCount)?.label : null;

  // 카테고리별 만족도 정렬 (리뷰 있는 것만)
  const catWithRate = (data.satisfaction_by_category || []).filter((c) => c.reviewed >= 1);

  // 감정 상태 영향 차이
  const emoDiff = data.emotion_satisfaction_rate !== null && data.no_emotion_satisfaction_rate !== null
    ? data.emotion_satisfaction_rate - data.no_emotion_satisfaction_rate
    : null;

  const notEnoughData = data.total < 3;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* 헤더 */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-50 px-4 py-1.5 text-sm text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
          <Lightbulb size={14} />나의 의사결정 인사이트
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">결정 성향 분석</h1>
        <p className="text-gray-500 dark:text-gray-400">총 {data.total}개의 결정 데이터를 분석했습니다</p>
      </div>

      {notEnoughData && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          결정을 3개 이상 해야 더 정확한 성향 분석이 제공됩니다. ({data.total}/3)
        </div>
      )}

      {/* 결정 성향 카드 */}
      {data.traits && data.traits.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center gap-2">
            <Brain size={16} className="text-violet-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">나의 결정 성향</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.traits.map((t) => {
              const colors = TRAIT_COLORS[t.key] || TRAIT_COLORS.balanced;
              const IconComp = TRAIT_ICONS[t.icon] || SlidersHorizontal;
              return (
                <div key={t.key} className={cn('flex items-start gap-3 rounded-xl border p-4', colors.bg, colors.border)}>
                  <div className={cn('mt-0.5 shrink-0', colors.icon)}>
                    <IconComp size={18} />
                  </div>
                  <div>
                    <p className={cn('font-semibold', colors.text)}>{t.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 요약 수치 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="전체 만족도"
          value={data.overall_satisfaction_rate !== null ? `${data.overall_satisfaction_rate}%` : '—'}
          sub={data.reviewed_count > 0 ? `${data.reviewed_count}개 결정 평가됨` : '아직 평가 없음'}
          icon={Star}
          accent="violet"
        />
        <StatCard
          label="리뷰 완료율"
          value={`${data.review_rate}%`}
          sub={`${data.reviewed_count} / ${data.total}개`}
          icon={CheckCircle2}
          accent="green"
        />
        <StatCard
          label="평균 선택지 수"
          value={data.avg_options > 0 ? `${data.avg_options}개` : '—'}
          sub={data.avg_options >= 3.8 ? '다양한 가능성을 탐색' : data.avg_options <= 2.3 && data.avg_options > 0 ? '빠른 선택 집중형' : '표준적 범위'}
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          label="감정 기록 비율"
          value={`${data.emotion_usage_rate}%`}
          sub="결정 시 감정 상태 입력"
          icon={Heart}
          accent="amber"
        />
      </div>

      {/* 카테고리별 만족도 */}
      {catWithRate.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={16} className="text-violet-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">카테고리별 만족도</p>
          </div>
          <div className="space-y-4">
            {catWithRate.map((c) => (
              <div key={c.category}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                    <span>{getCategoryEmoji(c.category)}</span>
                    <span>{c.category}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">({c.reviewed}회 평가)</span>
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {c.satisfaction_rate !== null ? `${c.satisfaction_rate}%` : '—'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10">
                  <div
                    className={cn('h-2 rounded-full transition-all', c.satisfaction_rate >= 70 ? 'bg-green-500' : c.satisfaction_rate >= 40 ? 'bg-amber-400' : 'bg-red-400')}
                    style={{ width: `${c.satisfaction_rate ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 감정 상태 영향 */}
      {data.emotion_with_total > 0 && data.emotion_without_total > 0 && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <div className="mb-1 flex items-center gap-2">
            <Heart size={16} className="text-pink-400" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">감정 상태 기록의 영향</p>
          </div>
          <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">감정 상태를 입력했을 때와 아닐 때의 만족도 비교</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-pink-100 bg-pink-50 p-4 dark:border-pink-500/20 dark:bg-pink-500/10">
              <p className="text-xs text-pink-600 dark:text-pink-400 mb-1 font-medium">감정 입력함</p>
              <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                {data.emotion_satisfaction_rate !== null ? `${data.emotion_satisfaction_rate}%` : '—'}
              </p>
              <p className="mt-1 text-xs text-gray-400">{data.emotion_with_total}개 결정</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">감정 입력 안 함</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                {data.no_emotion_satisfaction_rate !== null ? `${data.no_emotion_satisfaction_rate}%` : '—'}
              </p>
              <p className="mt-1 text-xs text-gray-400">{data.emotion_without_total}개 결정</p>
            </div>
          </div>
          {emoDiff !== null && Math.abs(emoDiff) >= 5 && (
            <p className={cn('mt-4 rounded-xl px-4 py-3 text-sm',
              emoDiff > 0
                ? 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300'
                : 'bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-gray-300'
            )}>
              {emoDiff > 0
                ? `✦ 감정 상태를 기록하면 만족도가 ${emoDiff}%p 높아요. 감정 입력을 권장합니다.`
                : `✦ 감정 상태 없이도 충분히 좋은 결정을 하고 있어요.`}
            </p>
          )}
        </div>
      )}

      {/* 시간대별 결정 패턴 */}
      {data.hour_distribution && data.hour_distribution.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <div className="mb-1 flex items-center gap-2">
            <Clock size={16} className="text-violet-500" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">시간대별 결정 패턴</p>
          </div>
          {peakPeriod && (
            <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
              주로 <span className="font-semibold text-violet-600 dark:text-violet-300">{peakPeriod}</span>에 결정을 내려요
            </p>
          )}
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={hourChartData} barSize={28}>
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', background: '#1e1e2e', color: '#fff', fontSize: 12 }}
                formatter={(v) => [`${v}개`, '결정 수']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {hourChartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.count === maxHourCount ? '#7c3aed' : '#c4b5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 개인화 AI 사용 현황 */}
      {data.total >= 3 && (
        <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-500/30 dark:bg-violet-950/40">
          <div className="mb-3 flex items-center gap-2">
            <Brain size={16} className="text-violet-500 dark:text-violet-400" />
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">개인화 AI 현황</p>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">{data.reviewed_count}개</p>
              <p className="mt-1 text-xs text-violet-600/70 dark:text-violet-400/70">학습된 결정 패턴</p>
            </div>
            <div className="flex-1 pb-1">
              <MiniBar value={data.reviewed_count} max={data.total} color="bg-violet-500" />
              <p className="mt-1 text-right text-xs text-violet-500/70 dark:text-violet-400/50">
                {data.total}개 중 {data.reviewed_count}개 평가 완료
              </p>
            </div>
          </div>
          {data.reviewed_count >= 3 ? (
            <p className="mt-3 text-xs text-violet-600 dark:text-violet-400">
              ✦ 개인화 AI가 활성화되어 당신의 패턴을 반영한 추천을 드리고 있어요.
            </p>
          ) : (
            <p className="mt-3 text-xs text-violet-600/70 dark:text-violet-400/70">
              결정 {3 - data.reviewed_count}개를 더 평가하면 개인화 AI가 활성화됩니다.
            </p>
          )}
        </div>
      )}
    </main>
  );
}

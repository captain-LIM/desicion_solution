import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Loader2, TrendingUp, CheckCircle2, Bookmark,
  Brain, CalendarDays, ThumbsUp, Trophy,
} from 'lucide-react';
import { CATEGORIES } from '../lib/categories';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe', '#8b5cf6', '#6d28d9', '#4c1d95'];

function StatCard({ icon: Icon, label, value, sub, color = 'violet' }) {
  const colorMap = {
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-600/20 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-600/20 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400',
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#16161f]">
      <div className="mb-3 flex items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', colorMap[color])}>
          <Icon size={18} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-white/10 dark:bg-[#1a1a24]">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-bold text-violet-600 dark:text-violet-300">{payload[0].value}건</p>
    </div>
  );
};

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const axisColor = theme === 'dark' ? '#6b7280' : '#9ca3af';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  useEffect(() => {
    axios.get('/api/decisions/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-violet-500" />
    </div>
  );

  if (!stats) return null;

  // 카테고리에 이모지 추가
  const categoryData = stats.category_breakdown.map((item) => {
    const cat = CATEGORIES.find((c) => c.value === item.category);
    return { ...item, label: cat ? `${cat.emoji} ${item.category}` : item.category };
  });

  // 월별 추이 - 월 포맷
  const monthlyData = stats.monthly_trend.map((item) => ({
    ...item,
    label: item.month.slice(5) + '월',
  }));

  const topCat = CATEGORIES.find((c) => c.value === stats.top_category_this_month);

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">결정 통계</h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">나의 의사결정 패턴을 분석합니다</p>
      </div>

      {stats.total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Brain size={40} className="mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500">아직 결정 데이터가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">결정을 내리고 나면 통계가 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 요약 카드 */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Brain} label="총 결정 수" value={stats.total} sub="전체 기간" color="violet" />
            <StatCard icon={CalendarDays} label="이번 달" value={stats.this_month} sub="이달 결정 수" color="blue" />
            <StatCard
              icon={ThumbsUp}
              label="AI 추천 만족도"
              value={stats.satisfaction_rate !== null ? `${stats.satisfaction_rate}%` : '-'}
              sub={stats.reviewed_count > 0 ? `${stats.reviewed_count}건 재검토` : '재검토 없음'}
              color="green"
            />
            <StatCard icon={Bookmark} label="북마크" value={stats.bookmarked} sub="저장된 결정" color="amber" />
          </div>

          {/* 이번 달 인사이트 */}
          {(stats.top_category_this_month || stats.satisfaction_rate !== null) && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div className="mb-3 flex items-center gap-2">
                <Trophy size={16} className="text-violet-600 dark:text-violet-400" />
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">이번 달 인사이트</p>
              </div>
              <div className="space-y-2">
                {stats.top_category_this_month && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-violet-600 dark:text-violet-300">
                      {topCat ? `${topCat.emoji} ${stats.top_category_this_month}` : stats.top_category_this_month}
                    </span>{' '}
                    관련 고민을 가장 많이 했어요.
                  </p>
                )}
                {stats.satisfaction_rate !== null && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    AI 추천을 따른 결정의{' '}
                    <span className="font-medium text-violet-600 dark:text-violet-300">{stats.satisfaction_rate}%</span>에
                    만족했어요.
                  </p>
                )}
                {stats.this_month > 0 && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    이번 달{' '}
                    <span className="font-medium text-violet-600 dark:text-violet-300">{stats.this_month}번</span>의
                    결정을 내렸어요.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 월별 추이 */}
          {monthlyData.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#16161f]">
              <div className="mb-5 flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-600 dark:text-violet-400" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">최근 6개월 결정 추이</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barSize={32}>
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: gridColor }} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 카테고리 분석 */}
          {categoryData.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* 파이 차트 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#16161f]">
                <p className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">카테고리 분포</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}건`]} />
                    <Legend formatter={(v) => <span style={{ fontSize: 12, color: axisColor }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 카테고리 바 리스트 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#16161f]">
                <p className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">카테고리별 결정 수</p>
                <div className="space-y-3">
                  {categoryData.map((item, i) => (
                    <div key={i}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{item.count}건</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-violet-500 transition-all duration-500"
                          style={{ width: `${(item.count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 만족도 분석 */}
          {stats.reviewed_count > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#16161f]">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">재검토 만족도 분석</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>😊 만족 {stats.satisfaction_rate}%</span>
                    <span>😔 아쉬움 {100 - stats.satisfaction_rate}%</span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${stats.satisfaction_rate}%` }} />
                    <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${100 - stats.satisfaction_rate}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">총 {stats.reviewed_count}건 재검토 완료</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

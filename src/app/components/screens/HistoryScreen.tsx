import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useApp, type DaySummary, type Order } from '../../context/AppContext';

type View = 'daily' | 'weekly' | 'monthly';

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

const PAYMENT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  cash:  { bg: '#F0FDF4', color: '#16A34A', label: 'Cash' },
  upi:   { bg: '#EFF6FF', color: '#3B82F6', label: 'UPI' },
  card:  { bg: '#F5F3FF', color: '#7C3AED', label: 'Card' },
};

// ─── Day Card ─────────────────────────────────────────────────────────────────
function DayCard({
  day,
  t,
  onLoadOrders,
}: {
  day: DaySummary;
  t: (k: string, p?: Record<string, string | number>) => string;
  onLoadOrders: (date: string) => Promise<Order[]>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [orders, setOrders] = useState<Order[]>(day.orders);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const handleToggle = async () => {
    if (!expanded && orders.length === 0 && day.totalOrders > 0) {
      setLoadingOrders(true);
      try {
        const loaded = await onLoadOrders(day.date);
        setOrders(loaded);
      } finally {
        setLoadingOrders(false);
      }
    }
    setExpanded(e => !e);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-2.5" style={{ boxShadow: '0 2px 6px rgba(17,24,39,0.06)' }}>
      <button
        onClick={handleToggle}
        className="w-full flex items-center px-4 py-3.5 gap-3"
      >
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {formatShortDate(day.date)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {day.totalOrders} {t('history.orders_count')}
            {day.bestSellerName ? ` · ${day.bestSellerName} ×${day.bestSellerQty}` : ''}
          </p>
        </div>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 15, fontWeight: 700, color: '#F97316' }}>
          ₹{day.totalRevenue.toLocaleString('en-IN')}
        </span>
        {loadingOrders ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full shrink-0"
          />
        ) : (
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} className="text-gray-400" />
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100">
              {orders.length === 0 ? (
                <p className="px-4 py-3 text-xs text-gray-400" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {t('history.no_orders')}
                </p>
              ) : (
                orders.map((order, i) => {
                  const badge = PAYMENT_BADGE[order.paymentMode] ?? PAYMENT_BADGE.cash;
                  return (
                    <div key={order.id} className={`flex items-start px-4 py-2.5 gap-2.5 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#9CA3AF', minWidth: 44, paddingTop: 1 }}>
                        {order.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex-1 text-xs text-gray-600 leading-relaxed" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                        {order.items.map(it => `${it.name} ×${it.quantity}`).join(', ')}
                      </span>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 600, color: '#111827' }}>
                          ₹{order.total}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-xs font-medium"
                          style={{ fontSize: 10, backgroundColor: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Weekly View ──────────────────────────────────────────────────────────────
function WeeklyView({ data, t }: { data: DaySummary[]; t: (k: string, p?: Record<string, string | number>) => string }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const result = days.map((day, i) => {
      const summary = data[i + weekOffset * 7];
      return {
        day,
        revenue: summary?.totalRevenue ?? 0,
        orders: summary?.totalOrders ?? 0,
      };
    });
    return result;
  };

  const weekData = getWeekData();
  const weekTotal = weekData.reduce((s, d) => s + d.revenue, 0);
  const weekOrders = weekData.reduce((s, d) => s + d.orders, 0);

  const weekLabel = () => {
    const start = new Date();
    start.setDate(start.getDate() - weekOffset * 7 - 6);
    const end = new Date();
    end.setDate(end.getDate() - weekOffset * 7);
    return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  };

  return (
    <div className="px-4">
      {/* Week nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {weekLabel()}
        </span>
        <button
          onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ boxShadow: '0 2px 8px rgba(17,24,39,0.06)' }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekData} barCategoryGap="30%">
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fontFamily: 'Noto Sans, sans-serif', fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: '#FFF7ED' }}
              contentStyle={{
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'DM Mono, monospace',
              }}
              formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {weekData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.revenue > 0 ? '#F97316' : '#F3F4F6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <p className="text-center text-xs text-gray-500 mt-2" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('history.this_week', { amount: weekTotal.toLocaleString('en-IN'), count: weekOrders })}
        </p>
      </div>
    </div>
  );
}

// ─── Monthly View ─────────────────────────────────────────────────────────────
function MonthlyView({ data, t }: { data: DaySummary[]; t: (k: string, p?: Record<string, string | number>) => string }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

  const monthData = data.filter(d => {
    const date = new Date(d.date + 'T12:00:00');
    return date.getMonth() === targetMonth.getMonth() && date.getFullYear() === targetMonth.getFullYear();
  });

  const totalRevenue = monthData.reduce((s, d) => s + d.totalRevenue, 0);
  const totalOrders = monthData.reduce((s, d) => s + d.totalOrders, 0);
  const bestDay = monthData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  const avgDaily = monthData.length ? Math.round(totalRevenue / monthData.length) : 0;

  return (
    <div className="px-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonthOffset(m => m + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {formatMonthYear(targetMonth)}
        </span>
        <button
          onClick={() => setMonthOffset(m => Math.max(0, m - 1))}
          disabled={monthOffset === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {monthData.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-2">
          <span style={{ fontSize: 40 }}>📅</span>
          <p className="text-sm text-gray-400 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            No data for this month
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: t('history.earnings'), value: `₹${totalRevenue.toLocaleString('en-IN')}`, accent: true },
            { label: t('history.orders_count'), value: String(totalOrders), accent: false },
            { label: t('history.best_day'), value: bestDay ? formatShortDate(bestDay.date) : '--', accent: false },
            { label: t('history.avg_daily'), value: `₹${avgDaily.toLocaleString('en-IN')}`, accent: false },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-4"
              style={{ boxShadow: '0 2px 6px rgba(17,24,39,0.06)' }}
            >
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 700, color: card.accent ? '#F97316' : '#111827' }}>
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── History Skeleton ─────────────────────────────────────────────────────────
function HistorySkeleton() {
  return (
    <div className="px-4 flex flex-col gap-2.5 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3"
          style={{ boxShadow: '0 2px 6px rgba(17,24,39,0.04)' }}>
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-2 bg-gray-100 rounded w-36" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-14" />
          <div className="w-4 h-4 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── History Screen ───────────────────────────────────────────────────────────
export function HistoryScreen() {
  const { t, historicalData, historyLoading, fetchOrdersForDate } = useApp();
  const [view, setView] = useState<View>('daily');

  const VIEWS: { id: View; key: string }[] = [
    { id: 'daily', key: 'history.daily' },
    { id: 'weekly', key: 'history.weekly' },
    { id: 'monthly', key: 'history.monthly' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA]">
      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-4 pb-2 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('history.title')}
        </h1>
        {/* View switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className="flex-1 h-8 rounded-lg text-sm font-medium transition-all duration-200 relative"
              style={{ fontFamily: 'Noto Sans, sans-serif' }}
            >
              {view === v.id && (
                <motion.div
                  layoutId="viewTab"
                  className="absolute inset-0 bg-white rounded-lg"
                  style={{ boxShadow: '0 1px 4px rgba(17,24,39,0.1)' }}
                />
              )}
              <span className="relative z-10" style={{ color: view === v.id ? '#111827' : '#6B7280' }}>
                {t(v.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto pt-3" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'daily' && (
              historyLoading ? (
                <HistorySkeleton />
              ) : (
                <div className="px-4">
                  {historicalData.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-2">
                      <span style={{ fontSize: 40 }}>📋</span>
                      <p className="text-sm text-gray-400 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                        {t('history.no_history')}
                      </p>
                    </div>
                  ) : (
                    historicalData.map(day => (
                      <DayCard key={day.date} day={day} t={t} onLoadOrders={fetchOrdersForDate} />
                    ))
                  )}
                </div>
              )
            )}
            {view === 'weekly' && <WeeklyView data={historicalData} t={t} />}
            {view === 'monthly' && <MonthlyView data={historicalData} t={t} />}
          </motion.div>
        </AnimatePresence>
        <div className="h-6" />
      </div>
    </div>
  );
}

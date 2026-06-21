import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingDown, Clock, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

function formatHour(h: number): string {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const end = (h + 1) === 12 ? 12 : (h + 1) > 12 ? (h + 1) - 12 : (h + 1);
  const endPeriod = (h + 1) >= 12 ? 'PM' : 'AM';
  return `${h12} ${period} – ${end} ${endPeriod}`;
}

function formatDate(dateStr: string, language: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(language === 'en' ? 'en-IN' : 'en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ value, label, accent, index }: { value: string; label: string; accent?: boolean; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.06, duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1"
      style={{ boxShadow: '0 2px 8px rgba(17,24,39,0.06)' }}
    >
      <span
        style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 22,
          fontWeight: 700,
          color: accent ? '#F97316' : '#111827',
        }}
      >
        {value}
      </span>
      <span className="text-xs text-gray-500" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
        {label}
      </span>
    </motion.div>
  );
}

// ─── Close Day Screen ─────────────────────────────────────────────────────────
export function CloseDayScreen() {
  const { t, closeDaySummary, navigate, historicalData, language, todayOrders } = useApp();
  const fired = useRef(false);

  useEffect(() => {
    if (closeDaySummary && closeDaySummary.totalOrders > 0 && !fired.current) {
      fired.current = true;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#F97316', '#FCD34D', '#34D399', '#60A5FA', '#F472B6'],
        gravity: 0.9,
        scalar: 0.9,
      });
    }
  }, [closeDaySummary]);

  const yesterdaySummary = historicalData[0];
  const revenueChange = closeDaySummary && yesterdaySummary
    ? closeDaySummary.totalRevenue - yesterdaySummary.totalRevenue
    : null;

  if (!closeDaySummary) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#FAFAFA] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full"
        />
        <p className="text-sm text-gray-500" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('summary.computing')}
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Back button */}
      <div className="shrink-0 px-4 pt-3 pb-1">
        <button onClick={() => navigate('home')} className="text-gray-500 flex items-center gap-1 text-sm">
          <ArrowLeft size={16} />
          <span style={{ fontFamily: 'Noto Sans, sans-serif' }}>{t('common.back')}</span>
        </button>
      </div>

      {/* ── Celebration Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-4 px-6"
      >
        <motion.div
          animate={closeDaySummary.totalOrders > 0
            ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1.2, 1.1, 1.1, 1] }
            : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: 40, lineHeight: 1 }}
        >
          {closeDaySummary.totalOrders > 0 ? '🎉' : '😶'}
        </motion.div>
        <p className="text-xs text-gray-400 mt-2" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {formatDate(today, language)}
        </p>
        <h1 className="text-xl font-bold text-gray-900 text-center mt-1" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('summary.title')}
        </h1>
      </motion.div>

      {closeDaySummary.totalOrders === 0 ? (
        /* ── Empty Day ── */
        <div className="flex flex-col items-center justify-center flex-1 gap-2 px-8 pb-16">
          <p className="text-lg font-bold text-gray-500 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {t('summary.no_orders_title')}
          </p>
          <p className="text-sm text-gray-400 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {t('summary.no_orders_desc')}
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('home')}
            className="mt-4 w-full h-12 bg-orange-500 text-white font-semibold rounded-xl"
            style={{ fontFamily: 'Noto Sans, sans-serif', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
          >
            {t('summary.start_tomorrow')}
          </motion.button>
        </div>
      ) : (
        <div className="px-4 pb-8 flex flex-col gap-3">
          {/* ── 2×2 Metric Grid ── */}
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCard
              index={0}
              value={String(closeDaySummary.totalOrders)}
              label={t('summary.total_orders')}
            />
            <MetricCard
              index={1}
              value={`₹${closeDaySummary.totalRevenue.toLocaleString('en-IN')}`}
              label={t('summary.total_earnings')}
              accent
            />
            <MetricCard
              index={2}
              value={`₹${closeDaySummary.avgOrderValue}`}
              label={t('summary.avg_order')}
            />
            <MetricCard
              index={3}
              value={formatHour(closeDaySummary.busiestHour)}
              label={t('summary.busiest_hour')}
            />
          </div>

          {/* ── Best Seller Card ── */}
          {closeDaySummary.bestSellerName && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, type: 'spring', stiffness: 220, damping: 20 }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }}
            >
              <div className="w-11 h-11 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-orange-600 font-medium mb-0.5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {t('summary.best_seller')}
                </p>
                <p className="font-bold text-gray-900 text-base truncate" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {closeDaySummary.bestSellerName}
                </p>
                <p className="text-xs text-gray-500" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {t('summary.items_sold', { count: closeDaySummary.bestSellerQty })}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Slowest Seller Card ── */}
          {closeDaySummary.slowestSellerName && closeDaySummary.slowestSellerName !== closeDaySummary.bestSellerName && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65, type: 'spring', stiffness: 220, damping: 20 }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
            >
              <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                <TrendingDown size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium mb-0.5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {t('summary.slowest')}
                </p>
                <p className="font-semibold text-gray-700 text-base truncate" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {closeDaySummary.slowestSellerName}
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {t('summary.items_sold', { count: closeDaySummary.slowestSellerQty })}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── vs Yesterday ── */}
          {revenueChange !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="flex items-center justify-center px-4 py-2.5 rounded-xl"
              style={{
                backgroundColor: revenueChange > 0 ? '#F0FDF4' : revenueChange < 0 ? '#FEF2F2' : '#F9FAFB',
                border: `1px solid ${revenueChange > 0 ? '#BBF7D0' : revenueChange < 0 ? '#FECACA' : '#E5E7EB'}`,
              }}
            >
              <p
                className="font-semibold text-sm"
                style={{
                  fontFamily: 'Noto Sans, sans-serif',
                  color: revenueChange > 0 ? '#16A34A' : revenueChange < 0 ? '#DC2626' : '#6B7280',
                }}
              >
                {revenueChange > 0
                  ? t('summary.vs_yesterday_more', { amount: revenueChange.toLocaleString('en-IN') })
                  : revenueChange < 0
                  ? t('summary.vs_yesterday_less', { amount: Math.abs(revenueChange).toLocaleString('en-IN') })
                  : t('summary.vs_yesterday_same')}
              </p>
            </motion.div>
          )}

          {/* ── Today's Orders (quick list) ── */}
          {todayOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              style={{ boxShadow: '0 2px 8px rgba(17,24,39,0.04)' }}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {t('summary.today_orders_label')}
                </p>
              </div>
              {todayOrders.slice(-5).reverse().map((order, i) => (
                <div key={order.id} className={`px-4 py-2.5 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <Clock size={12} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-400 shrink-0" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {order.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex-1 text-xs text-gray-600 truncate" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                    {order.items.map(it => `${it.name} ×${it.quantity}`).join(', ')}
                  </span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 600, color: '#111827' }}>₹{order.total}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Start Fresh Button ── */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('home')}
            className="w-full h-[52px] bg-orange-500 text-white font-semibold rounded-xl mt-2"
            style={{
              fontFamily: 'Noto Sans, sans-serif',
              fontSize: 16,
              boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
            }}
          >
            {t('summary.start_tomorrow')}
          </motion.button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import type { MenuItem } from '../../context/AppContext';

// ─── Count Badge ────────────────────────────────────────────────────────────
function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key="badge"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-orange-500 rounded-full flex items-center justify-center z-10"
          style={{ boxShadow: '0 1px 4px rgba(249,115,22,0.5)' }}
        >
          <span className="text-white font-bold" style={{ fontSize: 10, fontFamily: 'DM Mono, monospace' }}>
            {count}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Menu Item Card ──────────────────────────────────────────────────────────
function MenuCard({ item, qty, onTap }: { item: MenuItem; qty: number; onTap: () => void }) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onTap(); }}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => { setPressed(false); onTap(); }}
      animate={{ scale: pressed ? 0.94 : 1 }}
      transition={{ duration: 0.15 }}
      className="relative flex flex-col items-center justify-center bg-white rounded-xl border overflow-visible focus:outline-none"
      style={{
        aspectRatio: '1/1',
        borderColor: qty > 0 ? '#FED7AA' : '#E5E7EB',
        borderWidth: qty > 0 ? 1.5 : 1,
        backgroundColor: pressed ? '#FFF7ED' : qty > 0 ? '#FFFBF5' : '#FFFFFF',
        boxShadow: '0 2px 6px rgba(17,24,39,0.06)',
      }}
    >
      <CountBadge count={qty} />
      <span
        className="text-center px-1 font-semibold text-gray-900 leading-tight mb-1"
        style={{ fontSize: 13, fontFamily: 'Noto Sans, sans-serif', maxWidth: '90%' }}
      >
        {item.name}
      </span>
      <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: '#F97316', fontWeight: 600 }}>
        ₹{item.price}
      </span>
    </motion.button>
  );
}

// ─── Cart Bar ────────────────────────────────────────────────────────────────
function CartBar({ itemCount, total, onConfirm, t }: { itemCount: number; total: number; onConfirm: () => void; t: (k: string, p?: Record<string, string | number>) => string }) {
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 h-16 border-t border-gray-200"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 -4px 20px rgba(17,24,39,0.1)',
          }}
        >
          <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            <span style={{ color: '#F97316' }}>{itemCount}</span>{' '}
            {t('home.cart_label', { count: itemCount, total }).split(' · ')[0].replace(String(itemCount), '').trim()} ·{' '}
            <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>₹{total}</span>
          </span>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="h-11 px-5 bg-orange-500 text-white font-semibold rounded-xl text-sm flex items-center gap-1"
            style={{
              fontFamily: 'Noto Sans, sans-serif',
              boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
            }}
          >
            {t('home.confirm_order')} →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────
export function HomeScreen() {
  const { t, menuItems, activeOrder, addToOrder, orderTotal, orderItemCount, navigate, todayTotal, todayOrderCount, closeDay, closeDayLoading } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const availableItems = menuItems.filter(it => it.isAvailable);
  const categories = ['All', ...Array.from(new Set(availableItems.map(it => it.category)))];
  const filtered = selectedCategory === 'All'
    ? availableItems
    : availableItems.filter(it => it.category === selectedCategory);

  const handleConfirmOrder = () => {
    navigate('order-summary');
  };

  const handleCloseDay = async () => {
    await closeDay();
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] relative">
      {/* ── Sticky Header ── */}
      <div
        className="shrink-0 px-4 flex items-center justify-between bg-white border-b border-gray-200"
        style={{ height: 64, boxShadow: '0 2px 8px rgba(17,24,39,0.06)' }}
      >
        <div>
          <div className="flex items-baseline gap-0.5">
            <span style={{ fontSize: 14, color: '#F97316', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>₹</span>
            <span style={{ fontSize: 26, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#111827' }}>
              {todayTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-xs text-gray-500" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {t('home.today_orders', { count: todayOrderCount })}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleCloseDay}
          disabled={closeDayLoading}
          className="flex items-center gap-1 px-3.5 h-9 rounded-lg border font-semibold text-xs border-orange-500"
          style={{
            fontFamily: 'Noto Sans, sans-serif',
            color: closeDayLoading ? '#FED7AA' : '#F97316',
            opacity: closeDayLoading ? 0.7 : 1,
          }}
        >
          {closeDayLoading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-3 h-3 border border-orange-300 border-t-orange-500 rounded-full"
            />
          ) : (
            <>
              {t('home.close_day')}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 4L5 7L8 4" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </motion.button>
      </div>

      {/* ── Category Filter ── */}
      {categories.length > 1 && (
        <div
          className="shrink-0 flex gap-2 px-4 py-2.5 overflow-x-auto bg-[#FAFAFA]"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0 h-8 px-3.5 rounded-full text-xs font-medium border transition-all duration-150"
              style={{
                fontFamily: 'Noto Sans, sans-serif',
                borderColor: selectedCategory === cat ? '#F97316' : '#E5E7EB',
                backgroundColor: selectedCategory === cat ? '#F97316' : '#FFFFFF',
                color: selectedCategory === cat ? '#FFFFFF' : '#6B7280',
                boxShadow: selectedCategory === cat ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Menu Grid ── */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-20"
        style={{ scrollbarWidth: 'none' }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <span style={{ fontSize: 48 }}>🍽️</span>
            <p className="text-sm font-semibold text-gray-500 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('home.no_menu')}
            </p>
            <button
              onClick={() => navigate('menu')}
              className="text-sm text-orange-500 font-semibold"
              style={{ fontFamily: 'Noto Sans, sans-serif' }}
            >
              Go to Menu →
            </button>
          </div>
        ) : (
          <div
            className="grid gap-2 py-2"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {filtered.map(item => (
              <MenuCard
                key={item.id}
                item={item}
                qty={activeOrder[item.id] ?? 0}
                onTap={() => addToOrder(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Cart Bar ── */}
      <CartBar
        itemCount={orderItemCount}
        total={orderTotal}
        onConfirm={handleConfirmOrder}
        t={t}
      />
    </div>
  );
}

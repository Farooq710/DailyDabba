import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Trash2, Banknote, Smartphone, CreditCard, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type PaymentMode = 'cash' | 'upi' | 'card';

const PAYMENT_MODES: { id: PaymentMode; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'cash', labelKey: 'order.cash', icon: <Banknote size={14} /> },
  { id: 'upi', labelKey: 'order.upi', icon: <Smartphone size={14} /> },
  { id: 'card', labelKey: 'order.card', icon: <CreditCard size={14} /> },
];

// ─── Token Overlay ────────────────────────────────────────────────────────────
function TokenOverlay({ token, onDone, t }: { token: number; onDone: () => void; t: (k: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white flex flex-col items-center justify-center z-20 px-8"
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 18 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="text-green-600 font-semibold text-lg flex items-center gap-2" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#16A34A" strokeWidth="2" />
            <path d="M6 10L9 13L14 7" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Order Placed!
        </div>

        <p className="text-sm text-gray-500 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('order.token_title')}
        </p>

        <motion.div
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center"
          style={{ border: '3px solid #FED7AA', backgroundColor: '#FFF7ED' }}
        >
          <span style={{ fontSize: 18, color: '#9CA3AF', fontFamily: 'DM Mono, monospace' }}>#</span>
          <span style={{ fontSize: 56, fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#F97316', lineHeight: 1 }}>
            {token}
          </span>
        </motion.div>

        <p className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('order.token_instruction')}
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="w-full h-12 bg-orange-500 text-white font-semibold rounded-xl text-sm"
          style={{ fontFamily: 'Noto Sans, sans-serif', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
        >
          {t('order.next_customer')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Order Summary Screen ─────────────────────────────────────────────────────
export function OrderSummaryScreen() {
  const { t, activeOrderItems, orderTotal, setItemQuantity, removeFromOrder, placeOrder, navigate, showToast } = useApp();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<number | null>(null);

  const handlePlaceOrder = async () => {
    if (activeOrderItems.length === 0) return;
    setLoading(true);
    try {
      const tokenNum = await placeOrder(paymentMode);
      setToken(tokenNum);
      showToast(t('home.order_placed'), 'success');
    } catch {
      // Error toast shown by placeOrder in AppContext
    } finally {
      setLoading(false);
    }
  };

  const handleTokenDone = () => {
    setToken(null);
    navigate('home');
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] relative overflow-hidden">
      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200"
      >
        <button onClick={() => navigate('home')} className="flex items-center gap-1 text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-gray-900 text-base" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('order.title')}
        </span>
        <button
          onClick={() => navigate('home')}
          className="text-sm text-orange-500 font-semibold"
          style={{ fontFamily: 'Noto Sans, sans-serif' }}
        >
          {t('order.add_more')}
        </button>
      </div>

      {/* ── Items list ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {activeOrderItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-sm text-gray-500" style={{ fontFamily: 'Noto Sans, sans-serif' }}>{t('order.empty')}</p>
            <button onClick={() => navigate('home')} className="text-sm text-orange-500 font-semibold">
              ← Back to menu
            </button>
          </div>
        ) : (
          <div className="px-4">
            {activeOrderItems.map((item, i) => (
              <div key={item.id}>
                <div className="flex items-center h-14 gap-2">
                  <span className="flex-1 text-sm font-semibold text-gray-900 leading-tight" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                    {item.name}
                  </span>
                  {/* Qty control */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (item.quantity === 1) removeFromOrder(item.id);
                        else setItemQuantity(item.id, item.quantity - 1);
                      }}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center"
                      style={{ color: item.quantity === 1 ? '#DC2626' : '#6B7280' }}
                    >
                      {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                    </motion.button>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: 'center', color: '#111827' }}>
                      {item.quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500"
                    >
                      <Plus size={12} />
                    </motion.button>
                  </div>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 600, color: '#111827', minWidth: 52, textAlign: 'right' }}>
                    ₹{item.subtotal}
                  </span>
                </div>
                {i < activeOrderItems.length - 1 && <div className="h-px bg-gray-100" />}
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {activeOrderItems.length > 0 && (
          <div className="mx-4 mt-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500" style={{ fontFamily: 'Noto Sans, sans-serif' }}>{t('order.total')}</span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 700, color: '#F97316' }}>
              ₹{orderTotal}
            </span>
          </div>
        )}

        {/* Payment mode */}
        <div className="px-4 mt-4">
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider" style={{ fontFamily: 'Noto Sans, sans-serif', letterSpacing: '0.08em' }}>
            {t('order.payment_mode')}
          </p>
          <div className="flex gap-2">
            {PAYMENT_MODES.map(pm => (
              <motion.button
                key={pm.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPaymentMode(pm.id)}
                className="flex-1 h-11 rounded-xl border flex items-center justify-center gap-1.5 font-medium text-sm transition-all duration-150"
                style={{
                  fontFamily: 'Noto Sans, sans-serif',
                  borderColor: paymentMode === pm.id ? '#F97316' : '#E5E7EB',
                  backgroundColor: paymentMode === pm.id ? '#FFF7ED' : '#FFFFFF',
                  color: paymentMode === pm.id ? '#F97316' : '#6B7280',
                  borderWidth: paymentMode === pm.id ? 1.5 : 1,
                }}
              >
                {pm.icon}
                {t(pm.labelKey)}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="h-28" />
      </div>

      {/* ── Place Order Button ── */}
      <div className="shrink-0 px-4 pb-4 pt-3 bg-white border-t border-gray-200">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePlaceOrder}
          disabled={loading || activeOrderItems.length === 0}
          className="w-full h-[52px] bg-orange-500 text-white font-semibold rounded-xl flex items-center justify-center"
          style={{
            fontFamily: 'Noto Sans, sans-serif',
            fontSize: 16,
            boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
            opacity: (loading || activeOrderItems.length === 0) ? 0.7 : 1,
          }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : t('order.place_order')}
        </motion.button>
      </div>

      {/* ── Token Overlay ── */}
      <AnimatePresence>
        {token !== null && (
          <TokenOverlay token={token} onDone={handleTokenDone} t={t} />
        )}
      </AnimatePresence>
    </div>
  );
}

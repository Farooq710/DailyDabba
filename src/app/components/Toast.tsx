import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Toast() {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="absolute top-0 left-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
          style={{
            marginTop: 6,
            borderLeftWidth: 4,
            borderLeftColor: toast.type === 'success' ? '#16A34A' : '#DC2626',
            backgroundColor: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          }}
        >
          {toast.type === 'success'
            ? <CheckCircle size={18} color="#16A34A" className="shrink-0" />
            : <XCircle size={18} color="#DC2626" className="shrink-0" />}
          <p
            className="text-sm font-medium flex-1"
            style={{
              fontFamily: 'Noto Sans, sans-serif',
              color: toast.type === 'success' ? '#14532D' : '#7F1D1D',
            }}
          >
            {toast.message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

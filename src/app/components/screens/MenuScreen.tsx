import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useApp, type MenuItem } from '../../context/AppContext';

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
function ItemSheet({
  item,
  categories,
  onSave,
  onClose,
  t,
}: {
  item: MenuItem | null;
  categories: string[];
  onSave: (data: Omit<MenuItem, 'id' | 'sortOrder'>) => void;
  onClose: () => void;
  t: (k: string) => string;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [price, setPrice] = useState(item?.price ? String(item.price) : '');
  const [category, setCategory] = useState(item?.category ?? '');
  const [available, setAvailable] = useState(item?.isAvailable ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) e.price = 'Enter a valid price';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ name: name.trim(), price: parseFloat(price), category: category.trim(), isAvailable: available });
    onClose();
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl z-30 overflow-hidden"
      style={{ boxShadow: '0 -8px 32px rgba(17,24,39,0.16)', maxHeight: '75%' }}
    >
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 bg-gray-200 rounded-full" />
      </div>

      <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: 'calc(75vh - 40px)', scrollbarWidth: 'none' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {item ? t('menu.edit_item') : t('menu.add_item')}
          </h2>
          <button onClick={onClose} className="text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('menu.item_name')} *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('menu.name_placeholder')}
              className="w-full h-11 px-3 rounded-xl border bg-gray-50 text-sm text-gray-900 outline-none"
              style={{ fontFamily: 'Noto Sans, sans-serif', borderColor: errors.name ? '#DC2626' : '#E5E7EB', borderWidth: 1.5 }}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('menu.item_price')} *
            </label>
            <div
              className="flex items-center h-11 px-3 rounded-xl border bg-gray-50 gap-1"
              style={{ borderColor: errors.price ? '#DC2626' : '#E5E7EB', borderWidth: 1.5 }}
            >
              <span className="text-orange-500 font-semibold" style={{ fontFamily: 'DM Mono, monospace' }}>₹</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none"
                style={{ fontFamily: 'DM Mono, monospace' }}
              />
            </div>
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('menu.item_category')}
            </label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder={t('menu.category_placeholder')}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none"
              style={{ fontFamily: 'Noto Sans, sans-serif', borderWidth: 1.5 }}
            />
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="px-2.5 py-1 rounded-xl text-xs border border-gray-200 text-gray-600 bg-gray-50"
                    style={{ fontFamily: 'Noto Sans, sans-serif' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('menu.available')}
            </span>
            <button
              onClick={() => setAvailable(a => !a)}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
              style={{ backgroundColor: available ? '#16A34A' : '#D1D5DB' }}
            >
              <motion.div
                animate={{ x: available ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
              />
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full h-12 mt-6 bg-orange-500 text-white font-semibold rounded-xl"
          style={{ fontFamily: 'Noto Sans, sans-serif', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
        >
          {item ? t('menu.update_item') : t('menu.save_item')}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Menu Item Row ────────────────────────────────────────────────────────────
function MenuRow({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative overflow-hidden">
      <div className="relative bg-white flex items-center px-4 h-[60px] border-b border-gray-100 group">
        {/* Drag handle */}
        <div className="mr-3 text-gray-300 shrink-0">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="3" cy="2" r="1.5" /><circle cx="7" cy="2" r="1.5" />
            <circle cx="3" cy="7" r="1.5" /><circle cx="7" cy="7" r="1.5" />
            <circle cx="3" cy="12" r="1.5" /><circle cx="7" cy="12" r="1.5" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-sm truncate"
            style={{ fontFamily: 'Noto Sans, sans-serif', color: item.isAvailable ? '#111827' : '#9CA3AF' }}
          >
            {item.name}
          </p>
          {item.category && (
            <span
              className="inline-block mt-0.5 px-1.5 py-0.5 text-gray-500 rounded"
              style={{ fontSize: 11, fontFamily: 'Noto Sans, sans-serif', backgroundColor: '#F3F4F6' }}
            >
              {item.category}
            </span>
          )}
        </div>

        <span
          className="mx-3 font-semibold shrink-0"
          style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, color: item.isAvailable ? '#F97316' : '#9CA3AF' }}
        >
          ₹{item.price}
        </span>

        <button
          onClick={onToggle}
          className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 mr-2"
          style={{ backgroundColor: item.isAvailable ? '#16A34A' : '#D1D5DB' }}
        >
          <motion.div
            animate={{ x: item.isAvailable ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          />
        </button>

        {/* Action buttons */}
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Delete confirm inline */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-50 flex items-center justify-between px-4 z-10"
          >
            <p className="text-sm font-medium text-red-700 truncate flex-1 mr-3" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              Delete "{item.name}"?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 font-medium">
                Cancel
              </button>
              <button onClick={() => { onDelete(); setConfirming(false); }} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium">
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center px-4 h-[60px] border-b border-gray-100 gap-3 animate-pulse">
      <div className="w-3 h-8 bg-gray-100 rounded" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-3 bg-gray-200 rounded w-28" />
        <div className="h-2 bg-gray-100 rounded w-14" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-10" />
      <div className="w-12 h-6 bg-gray-200 rounded-full" />
      <div className="flex gap-1">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Menu Screen ──────────────────────────────────────────────────────────────
export function MenuScreen() {
  const { t, menuItems, menuLoading, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  const categories = Array.from(new Set(menuItems.map(it => it.category).filter(Boolean)));

  const openAdd = () => { setEditItem(null); setSheetOpen(true); };
  const openEdit = (item: MenuItem) => { setEditItem(item); setSheetOpen(true); };
  const closeSheet = () => { setSheetOpen(false); setEditItem(null); };

  const handleSave = (data: Omit<MenuItem, 'id' | 'sortOrder'>) => {
    if (editItem) {
      updateMenuItem(editItem.id, data);
    } else {
      addMenuItem(data);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] relative overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('menu.title')}
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openAdd}
          className="flex items-center gap-1 h-9 px-3.5 bg-orange-500 text-white text-sm font-semibold rounded-lg"
          style={{ fontFamily: 'Noto Sans, sans-serif' }}
        >
          <Plus size={14} />
          {t('menu.add_item')}
        </motion.button>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {menuLoading ? (
          <div className="mx-4 mt-3 rounded-xl overflow-hidden border border-gray-100 bg-white"
            style={{ boxShadow: '0 1px 4px rgba(17,24,39,0.06)' }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <span style={{ fontSize: 64 }}>🍽️</span>
            <p className="text-base font-semibold text-gray-500 text-center px-8" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('menu.no_items')}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={openAdd}
              className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}
            >
              +
            </motion.button>
          </div>
        ) : (
          <div className="mx-4 mt-3 rounded-xl overflow-hidden border border-gray-100 bg-white"
            style={{ boxShadow: '0 1px 4px rgba(17,24,39,0.06)' }}>
            {menuItems.map(item => (
              <MenuRow
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => deleteMenuItem(item.id)}
                onToggle={() => toggleItemAvailability(item.id)}
              />
            ))}
          </div>
        )}
        <div className="h-4" />
      </div>

      {/* ── Sheet overlay ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="absolute inset-0 bg-black/40 z-20"
            />
            <ItemSheet
              item={editItem}
              categories={categories}
              onSave={handleSave}
              onClose={closeSheet}
              t={t}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

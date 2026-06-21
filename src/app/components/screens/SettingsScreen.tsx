import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Globe } from 'lucide-react';
import { useApp, type Language } from '../../context/AppContext';
import { LANGUAGE_LABELS } from '../../data/translations';

const LANGUAGES: Language[] = ['en', 'hi', 'te', 'ta', 'kn', 'ml'];

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="px-4 pt-5 pb-2 text-xs font-semibold text-gray-400 uppercase"
      style={{ fontFamily: 'Noto Sans, sans-serif', letterSpacing: '0.08em' }}
    >
      {label}
    </p>
  );
}

function SettingsRow({ label, right, onPress }: { label: string; right?: React.ReactNode; onPress?: () => void }) {
  return (
    <button
      className="w-full flex items-center px-4 h-[52px] bg-white border-b border-gray-100 last:border-0 focus:outline-none active:bg-gray-50"
      onClick={onPress}
    >
      <span className="flex-1 text-sm font-medium text-gray-900 text-left" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
        {label}
      </span>
      {right}
    </button>
  );
}

// ─── Language Picker Modal ────────────────────────────────────────────────────
function LanguageModal({ onClose, t }: { onClose: () => void; t: (k: string) => string }) {
  const { language, setLanguage } = useApp();
  const [selected, setSelected] = useState<Language>(language);

  const handleSelect = (lang: Language) => {
    setSelected(lang);
    setLanguage(lang);
    setTimeout(onClose, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 z-30 flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="w-full bg-white rounded-t-3xl"
        style={{ boxShadow: '0 -8px 32px rgba(17,24,39,0.16)' }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-5 pb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {t('onboarding.choose_language')}
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {LANGUAGES.map(lang => (
              <motion.button
                key={lang}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(lang)}
                className="flex items-center justify-center h-16 rounded-xl border font-semibold"
                style={{
                  fontSize: 16,
                  fontFamily: 'Noto Sans, sans-serif',
                  borderColor: selected === lang ? '#F97316' : '#E5E7EB',
                  borderWidth: selected === lang ? 2 : 1.5,
                  backgroundColor: selected === lang ? '#FFF7ED' : '#FAFAFA',
                  color: selected === lang ? '#F97316' : '#111827',
                }}
              >
                {LANGUAGE_LABELS[lang]}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
export function SettingsScreen() {
  const { t, language, user, logout } = useApp();
  const [businessName, setBusinessName] = useState(user?.businessName ?? '');
  const [printerEnabled, setPrinterEnabled] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#F3F4F6] relative overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 px-4 h-14 bg-white border-b border-gray-200 flex items-center">
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          {t('settings.title')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8" style={{ scrollbarWidth: 'none' }}>
        {/* ── Business ── */}
        <SectionLabel label={t('settings.business_section')} />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(17,24,39,0.06)' }}>
          <div className="flex items-center px-4 h-[52px] border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900 mr-3" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('settings.business_name')}
            </span>
            <input
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="flex-1 text-sm text-gray-700 text-right bg-transparent outline-none"
              style={{ fontFamily: 'Noto Sans, sans-serif' }}
              placeholder="Enter business name"
            />
          </div>
        </div>

        {/* ── Language ── */}
        <SectionLabel label={t('settings.language_section')} />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(17,24,39,0.06)' }}>
          <button
            onClick={() => setLangModalOpen(true)}
            className="w-full flex items-center px-4 h-[52px]"
          >
            <Globe size={16} className="text-gray-400 mr-2.5 shrink-0" />
            <span className="flex-1 text-sm font-medium text-gray-900 text-left" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('settings.language')}
            </span>
            <span className="text-sm text-gray-500 mr-2" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {LANGUAGE_LABELS[language]}
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>

        {/* ── Hardware ── */}
        <SectionLabel label={t('settings.hardware_section')} />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(17,24,39,0.06)' }}>
          <div className="flex items-center px-4 h-[52px]">
            <span className="flex-1 text-sm font-medium text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('settings.printer')}
            </span>
            <button
              onClick={() => setPrinterEnabled(p => !p)}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
              style={{ backgroundColor: printerEnabled ? '#16A34A' : '#D1D5DB' }}
            >
              <motion.div
                animate={{ x: printerEnabled ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
              />
            </button>
          </div>
          {printerEnabled && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-orange-50">
              <p className="text-xs text-orange-700" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                {t('settings.printer_info')} (Phase 2)
              </p>
            </div>
          )}
        </div>

        {/* ── About ── */}
        <SectionLabel label={t('settings.about_section')} />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(17,24,39,0.06)' }}>
          <div className="flex items-center px-4 h-[52px] border-b border-gray-100">
            <span className="flex-1 text-sm font-medium text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('settings.app_version')}
            </span>
            <span className="text-sm text-gray-500" style={{ fontFamily: 'DM Mono, monospace' }}>v2.0.0</span>
          </div>
          <button className="w-full flex items-center px-4 h-[52px]">
            <span className="flex-1 text-sm font-medium text-gray-900 text-left" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('settings.rate_app')}
            </span>
            <span className="text-yellow-400 text-base">★★★★★</span>
            <ChevronRight size={16} className="text-gray-400 ml-1" />
          </button>
        </div>

        {/* ── Sign Out ── */}
        <div className="mx-4 mt-4 mb-2 bg-white rounded-xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(17,24,39,0.06)' }}>
          <button
            onClick={() => setConfirmSignOut(true)}
            className="w-full flex items-center justify-center px-4 h-[52px]"
          >
            <span className="text-sm font-semibold text-red-500" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {t('settings.sign_out')}
            </span>
          </button>
        </div>
      </div>

      {/* ── Language Modal ── */}
      <AnimatePresence>
        {langModalOpen && (
          <LanguageModal onClose={() => setLangModalOpen(false)} t={t} />
        )}
      </AnimatePresence>

      {/* ── Sign Out Confirm ── */}
      <AnimatePresence>
        {confirmSignOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center px-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="w-full bg-white rounded-2xl p-6 flex flex-col items-center gap-4"
            >
              <p className="text-base font-semibold text-gray-900 text-center" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                {t('settings.sign_out_confirm')}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmSignOut(false)}
                  className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Noto Sans, sans-serif' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={logout}
                  className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold"
                  style={{ fontFamily: 'Noto Sans, sans-serif' }}
                >
                  {t('settings.sign_out')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

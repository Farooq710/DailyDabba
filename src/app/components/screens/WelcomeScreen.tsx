import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp, type Language } from '../../context/AppContext';
import { LANGUAGE_LABELS } from '../../data/translations';

const LANGUAGES: Language[] = ['en', 'hi', 'te', 'ta', 'kn', 'ml'];

export function WelcomeScreen() {
  const { setLanguage, navigate } = useApp();
  const [selected, setSelected] = useState<Language | null>(null);

  const handleSelect = (lang: Language) => {
    setSelected(lang);
    setLanguage(lang);
    setTimeout(() => navigate('onboarding'), 300);
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] overflow-y-auto">
      {/* Top area */}
      <div className="flex flex-col items-center pt-14 pb-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span style={{ fontSize: 32 }}>🍱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            DailyDabba
          </h1>
          <p className="text-xs text-gray-400" style={{ fontFamily: 'Noto Sans, sans-serif', letterSpacing: '0.05em' }}>
            ఆర్డర్లు · ऑर्डर · Orders
          </p>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-base text-gray-500 font-medium mb-6 px-6"
        style={{ fontFamily: 'Noto Sans, sans-serif' }}
      >
        Choose your language
      </motion.p>

      {/* Language grid */}
      <div className="grid grid-cols-2 gap-3 px-6">
        {LANGUAGES.map((lang, i) => (
          <motion.button
            key={lang}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSelect(lang)}
            className="relative flex items-center justify-center h-[72px] rounded-xl bg-white border transition-all duration-200 focus:outline-none"
            style={{
              borderColor: selected === lang ? '#F97316' : '#E5E7EB',
              borderWidth: selected === lang ? 2 : 1.5,
              backgroundColor: selected === lang ? '#FFF7ED' : '#FFFFFF',
              boxShadow: selected === lang
                ? '0 2px 12px rgba(249,115,22,0.18)'
                : '0 2px 8px rgba(17,24,39,0.06)',
            }}
          >
            <span
              className="font-semibold"
              style={{
                fontSize: 17,
                fontFamily: 'Noto Sans, sans-serif',
                color: selected === lang ? '#F97316' : '#111827',
              }}
            >
              {LANGUAGE_LABELS[lang]}
            </span>
            {selected === lang && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex-1" />
      <p className="text-center text-xs text-gray-300 pb-4">
        Walk-in Order Manager for Tiffin Centers
      </p>
    </div>
  );
}

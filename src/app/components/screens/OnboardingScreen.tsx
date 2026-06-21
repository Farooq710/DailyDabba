import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

const SLIDES = [
  { emoji: '📓', titleKey: 'onboarding.step1_title', descKey: 'onboarding.step1_desc', bg: '#FFFBF7' },
  { emoji: '🏆', titleKey: 'onboarding.step2_title', descKey: 'onboarding.step2_desc', bg: '#FFF7ED' },
  { emoji: '🌐', titleKey: 'onboarding.step3_title', descKey: 'onboarding.step3_desc', bg: '#FFFFFF' },
];

export function OnboardingScreen() {
  const { t, navigate } = useApp();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStart = useRef<number | null>(null);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (delta > 40 && current < SLIDES.length - 1) goTo(current + 1);
    if (delta < -40 && current > 0) goTo(current - 1);
    touchStart.current = null;
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      navigate('auth');
    }
  };

  const slide = SLIDES[current];

  return (
    <div
      className="h-full flex flex-col overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: slide.bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -60 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 flex flex-col items-center justify-center px-8 pt-8"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            className="mb-8"
            style={{
              fontSize: 80,
              filter: 'drop-shadow(0 8px 24px rgba(249,115,22,0.2))',
              lineHeight: 1,
            }}
          >
            {slide.emoji}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900 text-center mb-4"
            style={{ fontFamily: 'Noto Sans, sans-serif' }}
          >
            {t(slide.titleKey)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="text-base text-gray-500 text-center leading-relaxed"
            style={{ fontFamily: 'Noto Sans, sans-serif', maxWidth: 280 }}
          >
            {t(slide.descKey)}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 py-8">
        {SLIDES.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            animate={{
              width: i === current ? 20 : 8,
              backgroundColor: i === current ? '#F97316' : '#E5E7EB',
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-2 rounded-full"
            style={{ minWidth: 8 }}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="px-8 pb-10">
        {current === SLIDES.length - 1 ? (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="w-full h-[52px] bg-orange-500 text-white font-semibold rounded-xl flex items-center justify-center"
            style={{
              fontFamily: 'Noto Sans, sans-serif',
              fontSize: 17,
              boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
            }}
          >
            {t('onboarding.get_started')}
          </motion.button>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('auth')}
              className="text-gray-400 text-sm font-medium px-2"
              style={{ fontFamily: 'Noto Sans, sans-serif' }}
            >
              Skip
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="h-11 px-6 bg-orange-500 text-white font-semibold rounded-xl"
              style={{
                fontFamily: 'Noto Sans, sans-serif',
                fontSize: 15,
                boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
              }}
            >
              Next →
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

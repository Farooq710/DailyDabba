import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useApp, type AppScreen } from './context/AppContext';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { OrderSummaryScreen } from './components/screens/OrderSummaryScreen';
import { CloseDayScreen } from './components/screens/CloseDayScreen';
import { MenuScreen } from './components/screens/MenuScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';

const TAB_SCREENS: AppScreen[] = ['home', 'menu', 'history', 'settings'];
const AUTH_SCREENS: AppScreen[] = ['welcome', 'onboarding', 'auth'];

function ScreenContent({ screen }: { screen: AppScreen }) {
  switch (screen) {
    case 'welcome': return <WelcomeScreen />;
    case 'onboarding': return <OnboardingScreen />;
    case 'auth': return <AuthScreen />;
    case 'order-summary': return <OrderSummaryScreen />;
    case 'close-day': return <CloseDayScreen />;
    case 'home': return <HomeScreen />;
    case 'menu': return <MenuScreen />;
    case 'history': return <HistoryScreen />;
    case 'settings': return <SettingsScreen />;
    default: return <HomeScreen />;
  }
}

function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return (
    <div className="shrink-0 h-11 flex items-center justify-between px-6 bg-white" style={{ fontSize: 12, fontWeight: 600 }}>
      <span className="text-gray-900" style={{ fontFamily: 'DM Mono, monospace' }}>{time}</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#111827" />
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#111827" />
          <rect x="9" y="2.5" width="3" height="9.5" rx="0.5" fill="#111827" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#111827" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11C9.5 11.83 8.83 12.5 8 12.5C7.17 12.5 6.5 11.83 6.5 11C6.5 10.17 7.17 9.5 8 9.5Z" fill="#111827" />
          <path d="M2.5 5.5C4.7 3.3 7.1 2.5 8 2.5C8.9 2.5 11.3 3.3 13.5 5.5" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M5 8C5.8 7.2 6.85 6.8 8 6.8C9.15 6.8 10.2 7.2 11 8" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#111827" strokeWidth="1" />
          <rect x="1.5" y="1.5" width="17" height="9" rx="1.5" fill="#111827" />
          <path d="M22.5 4V8C23.33 7.5 23.33 4.5 22.5 4Z" fill="#111827" />
        </svg>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="shrink-0 h-8 flex items-center justify-center bg-white">
      <div className="w-32 h-1 bg-gray-900 rounded-full opacity-20" />
    </div>
  );
}

function AppInner() {
  const { screen, authLoading } = useApp();
  const isTabScreen = TAB_SCREENS.includes(screen);
  const isAuthScreen = AUTH_SCREENS.includes(screen);

  if (authLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#FAFAFA' }}>
      <StatusBar />
      <div className="flex-1 overflow-hidden relative min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: isAuthScreen ? 0 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAuthScreen ? 0 : -16 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 flex flex-col overflow-hidden"
          >
            <ScreenContent screen={screen} />
          </motion.div>
        </AnimatePresence>
        <Toast />
      </div>
      {isTabScreen && <BottomNav />}
      <HomeIndicator />
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden flex-shrink-0"
      style={{
        width: 390,
        height: 844,
        borderRadius: 48,
        boxShadow: `
          0 50px 100px -20px rgba(0,0,0,0.5),
          0 30px 60px -10px rgba(0,0,0,0.3),
          inset 0 0 0 1.5px rgba(255,255,255,0.15),
          inset 0 0 0 0.5px rgba(0,0,0,0.3)
        `,
        background: '#1a1a1a',
      }}
    >
      {/* Notch */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{ width: 120, height: 34, borderRadius: '0 0 24px 24px', backgroundColor: '#1a1a1a' }}
      />
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 44 }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #fed7aa 0%, #f97316 28%, #c2410c 58%, #7c2d12 100%)',
          padding: '24px',
          minHeight: '100vh',
        }}
      >
        {/* Side description — desktop only */}
        <div
          className="flex-col gap-4 mr-12 text-white"
          style={{ display: 'none' }}
          id="desktop-desc"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: 24 }}>🍱</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Noto Sans, sans-serif' }}>DailyDabba</h1>
              <p className="text-sm" style={{ fontFamily: 'Noto Sans, sans-serif', color: 'rgba(255,255,255,0.7)' }}>Walk-in Order Manager</p>
            </div>
          </div>
        </div>

        <PhoneFrame>
          <AppInner />
        </PhoneFrame>
      </div>
    </AppProvider>
  );
}

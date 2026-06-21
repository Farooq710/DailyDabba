import { motion } from 'motion/react';
import { Home, UtensilsCrossed, Clock, Settings } from 'lucide-react';
import { useApp, type ActiveTab } from '../context/AppContext';

const TABS: { id: ActiveTab; icon: React.ReactNode; labelKey: string }[] = [
  { id: 'home',     icon: <Home size={22} />,             labelKey: 'Home' },
  { id: 'menu',     icon: <UtensilsCrossed size={22} />,  labelKey: 'Menu' },
  { id: 'history',  icon: <Clock size={22} />,            labelKey: 'History' },
  { id: 'settings', icon: <Settings size={22} />,         labelKey: 'Settings' },
];

export function BottomNav() {
  const { activeTab, setActiveTab, navigate } = useApp();

  const handleTab = (id: ActiveTab) => {
    setActiveTab(id);
    navigate(id);
  };

  return (
    <div
      className="shrink-0 flex bg-white border-t border-gray-200"
      style={{ height: 58, boxShadow: '0 -2px 8px rgba(17,24,39,0.06)' }}
    >
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative focus:outline-none"
          >
            {/* Active indicator pill */}
            {active && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute top-1.5 w-8 h-0.5 bg-orange-500 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span style={{ color: active ? '#F97316' : '#9CA3AF', transition: 'color 150ms' }}>
              {tab.icon}
            </span>
            <span
              className="font-medium"
              style={{
                fontSize: 10,
                fontFamily: 'Noto Sans, sans-serif',
                color: active ? '#F97316' : '#9CA3AF',
                transition: 'color 150ms',
              }}
            >
              {tab.labelKey}
            </span>
          </button>
        );
      })}
    </div>
  );
}

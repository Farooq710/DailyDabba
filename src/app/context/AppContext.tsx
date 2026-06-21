import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { Tables, TablesUpdate, TablesInsert } from '../../lib/database.types';
import { dbMenuItemToUI, dbOrderWithItemsToUI, dbSummaryToUI } from '../../lib/adapters';
import { computeAndSaveDaySummary } from '../../lib/summaryEngine';
import { type Language, translations, interpolate } from '../data/translations';
import { type MenuItem, type Order, type OrderItem, type DaySummary } from '../data/mockData';

export type { Language };
export type { MenuItem, Order, OrderItem, DaySummary };

export type AppScreen =
  | 'welcome'
  | 'onboarding'
  | 'auth'
  | 'home'
  | 'order-summary'
  | 'close-day'
  | 'menu'
  | 'history'
  | 'settings';

export type ActiveTab = 'home' | 'menu' | 'history' | 'settings';

interface AppUser {
  id: string;
  email: string;
  businessName: string;
  printerEnabled: boolean;
  tokenSystemEnabled: boolean;
}

export interface DaySession {
  id: string;
  sessionDate: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt: string | null;
}

interface AppContextValue {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Navigation
  screen: AppScreen;
  activeTab: ActiveTab;
  navigate: (screen: AppScreen) => void;
  setActiveTab: (tab: ActiveTab) => void;

  // Auth
  authLoading: boolean;
  user: AppUser | null;
  signUp: (email: string, password: string, businessName: string, language: Language) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;

  // Menu
  menuItems: MenuItem[];
  menuLoading: boolean;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'sortOrder'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;

  // Active order
  activeOrder: Record<string, number>;
  addToOrder: (item: MenuItem) => void;
  removeFromOrder: (itemId: string) => void;
  setItemQuantity: (itemId: string, qty: number) => void;
  clearOrder: () => void;
  activeOrderItems: (MenuItem & { quantity: number; subtotal: number })[];
  orderTotal: number;
  orderItemCount: number;

  // Today
  todayOrders: Order[];
  todayTotal: number;
  todayOrderCount: number;
  tokenCount: number;
  placeOrder: (paymentMode: 'cash' | 'upi' | 'card') => Promise<number>;

  // History
  historicalData: DaySummary[];
  historyLoading: boolean;
  fetchOrdersForDate: (date: string) => Promise<Order[]>;
  closeDaySummary: DaySummary | null;

  // Day session
  daySession: DaySession | null;
  closeDay: () => Promise<void>;
  closeDayLoading: boolean;

  // Toast
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

// ── Type-safe query result helper ──────────────────────────────────────────────
// Supabase generic inference breaks in tsc -b composite mode; explicit casts fix it.
type QR<T> = { data: T | null; error: { message: string } | null };

function qr<T>(result: unknown): QR<T> {
  return result as QR<T>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [authLoading, setAuthLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Record<string, number>>({});
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [historicalData, setHistoricalData] = useState<DaySummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [closeDaySummary, setCloseDaySummary] = useState<DaySummary | null>(null);
  const [daySession, setDaySession] = useState<DaySession | null>(null);
  const [closeDayLoading, setCloseDayLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const user: AppUser | null = useMemo(() => {
    if (!supabaseUser || !profile) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      businessName: profile.business_name ?? '',
      printerEnabled: profile.printer_enabled,
      tokenSystemEnabled: profile.token_system_enabled,
    };
  }, [supabaseUser, profile]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Data fetchers (called in parallel after login) ──────────────────────────

  const fetchMenuItems = useCallback(async (userId: string) => {
    setMenuLoading(true);
    try {
      const { data, error } = qr<Tables<'menu_items'>[]>(
        await supabase.from('menu_items').select('*').eq('owner_id', userId).order('sort_order')
      );
      if (error) throw error;
      setMenuItems((data ?? []).map(dbMenuItemToUI));
    } catch {
      // Non-fatal — menu stays empty
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const fetchTodayOrders = useCallback(async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data: ordersData } = qr<Tables<'orders'>[]>(
      await supabase
        .from('orders')
        .select('*')
        .eq('owner_id', userId)
        .eq('order_date', today)
        .order('order_time', { ascending: true })
    );

    if (!ordersData?.length) { setTodayOrders([]); return; }

    const { data: itemsData } = qr<Tables<'order_items'>[]>(
      await supabase.from('order_items').select('*').in('order_id', ordersData.map(o => o.id))
    );

    setTodayOrders(
      ordersData.map(o => dbOrderWithItemsToUI(o, (itemsData ?? []).filter(it => it.order_id === o.id)))
    );
  }, []);

  const fetchHistory = useCallback(async (userId: string) => {
    setHistoryLoading(true);
    try {
      const { data, error } = qr<Tables<'daily_summaries'>[]>(
        await supabase
          .from('daily_summaries')
          .select('*')
          .eq('owner_id', userId)
          .order('summary_date', { ascending: false })
          .limit(90)
      );
      if (error) throw error;
      setHistoricalData((data ?? []).map(s => dbSummaryToUI(s, [])));
    } catch {
      // Non-fatal — history stays empty
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchDaySession = useCallback(async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = qr<Tables<'day_sessions'>>(
      await supabase
        .from('day_sessions')
        .select('*')
        .eq('owner_id', userId)
        .eq('session_date', today)
        .maybeSingle()
    );
    if (data) {
      setDaySession({
        id: data.id,
        sessionDate: data.session_date,
        status: data.status as 'open' | 'closed',
        openedAt: data.opened_at,
        closedAt: data.closed_at,
      });
    } else {
      // No session for today yet — create one
      const { data: newSession } = qr<Tables<'day_sessions'>>(
        await supabase
          .from('day_sessions')
          .insert({ owner_id: userId, session_date: today, status: 'open' })
          .select()
          .single()
      );
      if (newSession) {
        setDaySession({
          id: newSession.id,
          sessionDate: newSession.session_date,
          status: 'open',
          openedAt: newSession.opened_at,
          closedAt: null,
        });
      }
    }
  }, []);

  const fetchOrdersForDate = useCallback(async (date: string): Promise<Order[]> => {
    if (!user) return [];
    const today = new Date().toISOString().split('T')[0];
    if (date === today) return todayOrders;

    const { data: ordersData } = qr<Tables<'orders'>[]>(
      await supabase
        .from('orders')
        .select('*')
        .eq('owner_id', user.id)
        .eq('order_date', date)
        .order('order_time', { ascending: true })
    );

    if (!ordersData?.length) return [];

    const { data: itemsData } = qr<Tables<'order_items'>[]>(
      await supabase.from('order_items').select('*').in('order_id', ordersData.map(o => o.id))
    );

    return ordersData.map(o =>
      dbOrderWithItemsToUI(o, (itemsData ?? []).filter(it => it.order_id === o.id))
    );
  }, [user, todayOrders]);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = qr<Tables<'profiles'>>(
      await supabase.from('profiles').select('*').eq('id', userId).single()
    );
    if (data) {
      setProfile(data);
      setLanguageState(data.language_preference as Language);
      setScreen('home');
      setActiveTab('home');
    }
    setAuthLoading(false);
    // Fire all data fetches in parallel
    Promise.all([fetchMenuItems(userId), fetchTodayOrders(userId), fetchHistory(userId), fetchDaySession(userId)]);
  }, [fetchMenuItems, fetchTodayOrders, fetchHistory, fetchDaySession]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setMenuItems([]);
        setTodayOrders([]);
        setHistoricalData([]);
        setActiveOrder({});
        setDaySession(null);
        setScreen('welcome');
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const dict = translations[language] ?? translations['en'];
    const fallback = translations['en'];
    const template = dict[key] ?? fallback[key] ?? key;
    return params ? interpolate(template, params) : template;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => setLanguageState(lang), []);

  const navigate = useCallback((s: AppScreen) => {
    setScreen(s);
    if (s === 'home' || s === 'menu' || s === 'history' || s === 'settings') {
      setActiveTab(s as ActiveTab);
    }
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────────────────

  const signUp = useCallback(async (email: string, password: string, businessName: string, lang: Language) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { business_name: businessName, language_preference: lang } },
    });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // ── Menu CRUD ────────────────────────────────────────────────────────────────

  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id' | 'sortOrder'>) => {
    if (!user) return;
    const optimisticId = `opt-${Date.now()}`;
    const sortOrder = menuItems.length;
    setMenuItems(prev => [...prev, { ...item, id: optimisticId, sortOrder }]);
    try {
      const payload: TablesInsert<'menu_items'> = {
        owner_id: user.id,
        name: item.name,
        category: item.category || null,
        price: item.price,
        is_available: item.isAvailable,
        sort_order: sortOrder,
      };
      const { data, error } = qr<Tables<'menu_items'>>(
        await supabase.from('menu_items').insert(payload).select().single()
      );
      if (error) throw error;
      setMenuItems(prev => prev.map(m => m.id === optimisticId ? dbMenuItemToUI(data!) : m));
      showToast(t('menu.item_saved'), 'success');
    } catch {
      setMenuItems(prev => prev.filter(m => m.id !== optimisticId));
      showToast(t('common.error'), 'error');
    }
  }, [user, menuItems.length, showToast, t]);

  const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    const original = menuItems.find(m => m.id === id);
    if (!original) return;
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    const dbUpdates: TablesUpdate<'menu_items'> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category || null;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
    try {
      const { error } = qr<never>(
        await supabase.from('menu_items').update(dbUpdates as TablesUpdate<'menu_items'>).eq('id', id)
      );
      if (error) throw error;
      showToast(t('menu.item_saved'), 'success');
    } catch {
      setMenuItems(prev => prev.map(m => m.id === id ? original : m));
      showToast(t('common.error'), 'error');
    }
  }, [menuItems, showToast, t]);

  const deleteMenuItem = useCallback(async (id: string) => {
    const original = menuItems.find(m => m.id === id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
    setActiveOrder(prev => { const n = { ...prev }; delete n[id]; return n; });
    try {
      const { error } = qr<never>(
        await supabase.from('menu_items').delete().eq('id', id)
      );
      if (error) throw error;
    } catch {
      if (original) {
        setMenuItems(prev => {
          const next = [...prev];
          const idx = next.findIndex(m => m.sortOrder > original.sortOrder);
          if (idx === -1) return [...next, original];
          next.splice(idx, 0, original);
          return next;
        });
      }
      showToast(t('common.error'), 'error');
    }
  }, [menuItems, showToast, t]);

  const toggleItemAvailability = useCallback(async (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    const newAvail = !item.isAvailable;
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, isAvailable: newAvail } : m));
    try {
      const patch: TablesUpdate<'menu_items'> = { is_available: newAvail };
      const { error } = qr<never>(
        await supabase.from('menu_items').update(patch).eq('id', id)
      );
      if (error) throw error;
    } catch {
      setMenuItems(prev => prev.map(m => m.id === id ? { ...m, isAvailable: !newAvail } : m));
      showToast(t('common.error'), 'error');
    }
  }, [menuItems, showToast, t]);

  // ── Active order ─────────────────────────────────────────────────────────────

  const addToOrder = useCallback((item: MenuItem) => {
    setActiveOrder(prev => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }));
  }, []);

  const removeFromOrder = useCallback((itemId: string) => {
    setActiveOrder(prev => { const n = { ...prev }; delete n[itemId]; return n; });
  }, []);

  const setItemQuantity = useCallback((itemId: string, qty: number) => {
    if (qty <= 0) {
      setActiveOrder(prev => { const n = { ...prev }; delete n[itemId]; return n; });
    } else {
      setActiveOrder(prev => ({ ...prev, [itemId]: qty }));
    }
  }, []);

  const clearOrder = useCallback(() => setActiveOrder({}), []);

  const activeOrderItems = useMemo(() => {
    return Object.entries(activeOrder)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find(m => m.id === id);
        if (!item) return null;
        return { ...item, quantity: qty, subtotal: item.price * qty };
      })
      .filter(Boolean) as (MenuItem & { quantity: number; subtotal: number })[];
  }, [activeOrder, menuItems]);

  const orderTotal = useMemo(() => activeOrderItems.reduce((s, it) => s + it.subtotal, 0), [activeOrderItems]);
  const orderItemCount = useMemo(() => activeOrderItems.reduce((s, it) => s + it.quantity, 0), [activeOrderItems]);
  const todayTotal = useMemo(() => todayOrders.reduce((s, o) => s + o.total, 0), [todayOrders]);
  const todayOrderCount = useMemo(() => todayOrders.length, [todayOrders]);
  const tokenCount = useMemo(() => todayOrders.length, [todayOrders]);

  // ── Place order ──────────────────────────────────────────────────────────────

  const placeOrder = useCallback(async (paymentMode: 'cash' | 'upi' | 'card'): Promise<number> => {
    if (!user || activeOrderItems.length === 0) return 0;

    const capturedItems = activeOrderItems;
    const rollbackOrder: Record<string, number> = {};
    capturedItems.forEach(it => { rollbackOrder[it.id] = it.quantity; });

    const total = capturedItems.reduce((s, it) => s + it.subtotal, 0);
    const optimisticId = `opt-${Date.now()}`;
    const estimatedToken = todayOrders.length + 1;

    const optimisticOrder: Order = {
      id: optimisticId,
      time: new Date(),
      items: capturedItems.map(it => ({
        menuItemId: it.id, name: it.name, price: it.price,
        quantity: it.quantity, subtotal: it.subtotal,
      })),
      total,
      paymentMode,
      tokenNumber: profile?.token_system_enabled ? estimatedToken : undefined,
    };

    setTodayOrders(prev => [...prev, optimisticOrder]);
    clearOrder();

    try {
      // Determine token number
      let tokenNumber: number | null = null;
      if (profile?.token_system_enabled) {
        const today = new Date().toISOString().split('T')[0];
        const { data: maxData } = qr<Tables<'orders'>[]>(
          await supabase
            .from('orders')
            .select('token_number')
            .eq('owner_id', user.id)
            .eq('order_date', today)
            .order('token_number', { ascending: false })
            .limit(1)
        );
        tokenNumber = ((maxData?.[0]?.token_number as number | null) ?? 0) + 1;
      }

      // Insert order row
      const orderPayload: TablesInsert<'orders'> = {
        owner_id: user.id,
        total_amount: total,
        payment_mode: paymentMode,
        token_number: tokenNumber,
      };
      const { data: orderData, error: orderErr } = qr<Tables<'orders'>>(
        await supabase.from('orders').insert(orderPayload).select().single()
      );
      if (orderErr) throw orderErr;

      // Insert line items
      const itemsPayload: TablesInsert<'order_items'>[] = capturedItems.map(it => ({
        order_id: orderData!.id,
        menu_item_id: it.id,
        item_name: it.name,
        item_price: it.price,
        quantity: it.quantity,
        subtotal: it.subtotal,
      }));
      const { error: itemsErr } = qr<never>(
        await supabase.from('order_items').insert(itemsPayload)
      );
      if (itemsErr) throw itemsErr;

      // Replace optimistic entry with DB row
      setTodayOrders(prev => prev.map(o =>
        o.id === optimisticId
          ? { ...optimisticOrder, id: orderData!.id, tokenNumber: tokenNumber ?? undefined }
          : o
      ));

      return tokenNumber ?? estimatedToken;
    } catch {
      setTodayOrders(prev => prev.filter(o => o.id !== optimisticId));
      setActiveOrder(rollbackOrder);
      showToast(t('common.error'), 'error');
      throw new Error('placeOrder failed');
    }
  }, [user, profile, activeOrderItems, todayOrders.length, clearOrder, showToast, t]);

  // ── Close Day ────────────────────────────────────────────────────────────────

  const closeDay = useCallback(async () => {
    if (!user) return;
    setCloseDayLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const summary = await computeAndSaveDaySummary(user.id, today);
      // Attach today's in-memory orders so CloseDayScreen can render the list
      setCloseDaySummary({ ...summary, orders: todayOrders });
      if (daySession) {
        const patch: TablesUpdate<'day_sessions'> = {
          status: 'closed',
          closed_at: new Date().toISOString(),
        };
        qr<never>(
          await supabase.from('day_sessions').update(patch).eq('id', daySession.id)
        );
        setDaySession(prev => prev ? { ...prev, status: 'closed', closedAt: new Date().toISOString() } : null);
      }
      navigate('close-day');
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setCloseDayLoading(false);
    }
  }, [user, daySession, todayOrders, navigate, showToast, t]);

  const value: AppContextValue = {
    language, setLanguage, t,
    screen, activeTab, navigate, setActiveTab,
    authLoading, user, signUp, signIn, signOut, logout: signOut,
    menuItems, menuLoading, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability,
    activeOrder, addToOrder, removeFromOrder, setItemQuantity, clearOrder,
    activeOrderItems, orderTotal, orderItemCount,
    todayOrders, todayTotal, todayOrderCount, tokenCount, placeOrder,
    historicalData, historyLoading, fetchOrdersForDate, closeDaySummary,
    daySession, closeDay, closeDayLoading,
    toast, showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

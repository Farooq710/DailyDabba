import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Store, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function AuthScreen() {
  const { t, signIn, signUp, language, navigate, showToast } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.includes('@')) errs.email = t('auth.email_required');
    if (password.length < 6) errs.password = t('auth.password_min_length');
    if (mode === 'signup' && !businessName.trim()) errs.businessName = t('auth.business_required');
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, businessName, language);
        // onAuthStateChange in AppContext navigates to 'home' once session is live.
        // If email confirmation is required, no session fires — show a hint.
        showToast(t('auth.check_email'), 'success');
      } else {
        await signIn(email, password);
        // navigation is automatic via AppContext onAuthStateChange
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password')) {
        showToast(t('auth.invalid_credentials'), 'error');
      } else if (mode === 'signup') {
        showToast(t('auth.signup_failed'), 'error');
      } else {
        showToast(t('auth.signin_failed'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m);
    setErrors({});
    setEmail('');
    setPassword('');
    setBusinessName('');
  };

  const buttonLabel = loading
    ? (mode === 'signin' ? t('auth.signing_in') : t('auth.creating_account'))
    : (mode === 'signin' ? t('auth.sign_in') : t('auth.sign_up'));

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] overflow-y-auto">
      <div className="flex-1 flex flex-col px-6 pt-10 pb-6">
        {/* Back */}
        <button
          onClick={() => navigate('onboarding')}
          className="flex items-center gap-1 text-gray-500 text-sm mb-8 self-start"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('common.back')}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <span style={{ fontSize: 18 }}>🍱</span>
          </div>
          <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Noto Sans, sans-serif' }}>DailyDabba</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {mode === 'signin' ? t('auth.welcome_back') : t('auth.sign_up_desc')}
            </h1>
            <p className="text-sm text-gray-500 mb-8" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {mode === 'signin' ? t('auth.sign_in_desc') : t('auth.create_account_desc')}
            </p>

            <div className="flex flex-col gap-4">
              {/* Business name — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                    {t('auth.business_name_label')}
                  </label>
                  <div
                    className="flex items-center gap-3 px-4 h-[52px] bg-white rounded-xl border transition-all"
                    style={{ borderColor: errors.businessName ? '#DC2626' : '#E5E7EB', borderWidth: 1.5 }}
                  >
                    <Store size={16} className="text-gray-400 shrink-0" />
                    <input
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder={t('auth.business_placeholder')}
                      className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400"
                      style={{ fontFamily: 'Noto Sans, sans-serif' }}
                    />
                  </div>
                  {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {t('auth.email')}
                </label>
                <div
                  className="flex items-center gap-3 px-4 h-[52px] bg-white rounded-xl border transition-all"
                  style={{ borderColor: errors.email ? '#DC2626' : '#E5E7EB', borderWidth: 1.5 }}
                >
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400"
                    style={{ fontFamily: 'Noto Sans, sans-serif' }}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  {t('auth.password')}
                </label>
                <div
                  className="flex items-center gap-3 px-4 h-[52px] bg-white rounded-xl border transition-all"
                  style={{ borderColor: errors.password ? '#DC2626' : '#E5E7EB', borderWidth: 1.5 }}
                >
                  <Lock size={16} className="text-gray-400 shrink-0" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400"
                    style={{ fontFamily: 'Noto Sans, sans-serif' }}
                  />
                  <button onClick={() => setShowPw(p => !p)} className="text-gray-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="mt-8 w-full h-[52px] bg-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          style={{
            fontFamily: 'Noto Sans, sans-serif',
            fontSize: 16,
            boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
            opacity: loading ? 0.85 : 1,
          }}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>{buttonLabel}</span>
            </>
          ) : (
            buttonLabel
          )}
        </motion.button>

        {/* Switch mode */}
        <button
          onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-4 text-center text-sm text-orange-500 font-medium"
          style={{ fontFamily: 'Noto Sans, sans-serif' }}
        >
          {mode === 'signin' ? t('auth.new_here') : t('auth.already_have')}
        </button>
      </div>
    </div>
  );
}

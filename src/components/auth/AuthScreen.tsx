import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  sendPasswordReset,
  translateFirebaseAuthError,
} from '../../services/firebase/authService';
import { Button } from '../common/Button';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password reset modal
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setErrorMessage('Bitte gib deinen Namen ein.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Das Passwort muss mindestens 6 Zeichen lang sein.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Die beiden Passwörter stimmen nicht überein.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const userProfile = await registerWithEmail(email, password, displayName);
        useAuthStore.setState({ user: userProfile, isAuthenticated: true });
      } else {
        const userProfile = await loginWithEmail(email, password);
        useAuthStore.setState({ user: userProfile, isAuthenticated: true });
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      const code = err.code || '';
      setErrorMessage(translateFirebaseAuthError(code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);

    try {
      const userProfile = await signInWithGoogle();
      useAuthStore.setState({ user: userProfile, isAuthenticated: true });
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const code = err.code || '';
      setErrorMessage(translateFirebaseAuthError(code));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      await sendPasswordReset(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(translateFirebaseAuthError(err.code || ''));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-ios-light-bg via-gray-100 to-ios-light-bg dark:from-ios-dark-bg dark:via-black dark:to-ios-dark-bg select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-[22px] bg-gradient-to-br from-ios-blue to-indigo-600 items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-3">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            SchoolCal
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Dein persönlicher Schulkalender & digitaler Planer
          </p>
        </div>

        {/* Auth Card */}
        <div className="ios-card p-6 shadow-2xl backdrop-blur-2xl bg-white/90 dark:bg-ios-dark-card/90">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-ios-dark-secondary rounded-ios mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-ios-dark-card text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-ios-dark-card text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Registrieren
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-2.5 px-4 bg-white dark:bg-ios-dark-secondary hover:bg-gray-50 dark:hover:bg-ios-dark-tertiary border border-gray-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.98] mb-4"
          >
            {isGoogleLoading ? (
              <span className="w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Mit Google {mode === 'login' ? 'anmelden' : 'registrieren'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-200 dark:border-white/10 w-full" />
            <span className="bg-white dark:bg-ios-dark-card px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              oder mit E-Mail
            </span>
            <div className="border-t border-gray-200 dark:border-white/10 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleAuth} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Dein Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="z.B. Paul Schmidt"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@schule.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Passwort
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetSuccess(false);
                      setResetError('');
                      setIsResetOpen(true);
                    }}
                    className="text-xs font-semibold text-ios-blue hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoading || isGoogleLoading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Bitte warten...
                  </span>
                ) : mode === 'login' ? (
                  'Mit E-Mail anmelden'
                ) : (
                  'Konto erstellen'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-gray-400">
          <span>Sichere, private Cloud-Speicherung mit Firebase Firestore</span>
        </div>
      </motion.div>

      {/* Password Reset Dialog */}
      <AnimatePresence>
        {isResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-ios-dark-card rounded-2xl shadow-2xl p-5 z-10 border border-black/5 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-ios-blue" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Passwort zurücksetzen
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resetSuccess ? (
                <div className="py-4 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    E-Mail gesendet!
                  </h4>
                  <p className="text-xs text-gray-500">
                    Wir haben einen Link zum Zurücksetzen deines Passworts an <strong>{resetEmail}</strong> gesendet.
                  </p>
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => setIsResetOpen(false)}
                    >
                      Schließen
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Gib deine registrierte E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten.
                  </p>

                  {resetError && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium">
                      {resetError}
                    </div>
                  )}

                  <input
                    type="email"
                    required
                    placeholder="name@schule.de"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Wird gesendet...' : 'Zurücksetz-Link anfordern'}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

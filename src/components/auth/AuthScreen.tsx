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
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  loginWithEmail,
  registerWithEmail,
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
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password reset modal
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const { updateProfile } = useAuthStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

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

          {/* Form */}
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
                disabled={isLoading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Bitte warten...
                  </span>
                ) : mode === 'login' ? (
                  'Jetzt anmelden'
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

import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { activateLicenseCode } from '../../services/licensing/licenseService';
import { KeyRound, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, updateProfile } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !user) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await activateLicenseCode(user.uid, code.trim(), user.email);

      // Update local auth store
      updateProfile({
        plan: result.plan,
        planSource: 'LICENSE',
        planExpiresAt: result.expiresAt,
      });

      setSuccessMessage(result.message);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCode('');
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Die Aktivierung ist fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    setCode(val);
    if (error) setError(null);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Lizenzcode einlösen"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-ios-blue/10 text-ios-blue flex items-center justify-center shadow-xs mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            Gib deinen Lizenzcode ein
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Der Code schaltet Plus oder Pro sofort für deinen Account ({user?.email}) frei.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 text-center">
            Format: SCAL-PLUS-XXXX-XXXX-XXXX
          </label>
          <input
            type="text"
            required
            autoFocus
            disabled={loading || Boolean(successMessage)}
            value={code}
            onChange={handleInputChange}
            placeholder="SCAL-PLUS-7X4K-92PM-Q8FD"
            className="w-full px-3.5 py-3 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-center text-sm font-mono font-bold tracking-wider text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue uppercase"
          />
        </div>

        <div className="pt-2 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Abbrechen
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={loading || !code.trim() || Boolean(successMessage)}
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          >
            {loading ? 'Wird aktiviert...' : 'Jetzt aktivieren'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};

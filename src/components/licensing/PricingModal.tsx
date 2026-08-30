import React from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { PLAN_INFO, PLAN_LEVELS } from '../../config/features';
import { useSubscription } from '../../hooks/useSubscription';
import { Check, Sparkles, KeyRound } from 'lucide-react';
import type { UserPlan } from '../../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenActivation: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onOpenActivation,
}) => {
  const { plan: currentPlan, expiresAt, isLifetime } = useSubscription();

  const plans: UserPlan[] = ['STANDARD', 'PLUS', 'PRO'];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="SchoolCal Tarife & Lizenzen"
    >
      <div className="space-y-6 pb-2">
        <div className="text-center max-w-lg mx-auto space-y-1">
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Wähle den perfekten Plan für deine Schulzeit
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Lizenzen werden direkt per Lizenzcode freigeschaltet. Keine automatischen Abofallen oder versteckten Kosten.
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
          {plans.map((pKey) => {
            const meta = PLAN_INFO[pKey];
            const isCurrent = currentPlan === pKey;
            const isHigher = PLAN_LEVELS[currentPlan] >= PLAN_LEVELS[pKey];

            return (
              <div
                key={pKey}
                className={`rounded-2xl p-4 flex flex-col justify-between transition-all border ${
                  isCurrent
                    ? 'ring-2 ring-ios-blue bg-blue-50/50 dark:bg-ios-dark-secondary border-ios-blue/40 shadow-sm'
                    : 'bg-gray-50/60 dark:bg-ios-dark-secondary/60 border-black/5 dark:border-white/10'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${meta.badgeColor}`}>
                      {meta.badgeLabel}
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-ios-blue bg-blue-500/10 px-2 py-0.5 rounded-full">
                        Aktiver Tarif
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {meta.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 min-h-[32px]">
                      {meta.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Enthaltene Funktionen:
                    </div>
                    <ul className="space-y-1.5">
                      {meta.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expiry info if current */}
                <div className="pt-4 mt-3 border-t border-black/5 dark:border-white/5">
                  {isCurrent ? (
                    <div className="text-center text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {isLifetime ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Dauerhaft aktiv (Lifetime)
                        </span>
                      ) : expiresAt ? (
                        <span>
                          Gültig bis:{' '}
                          <strong>
                            {format(new Date(expiresAt), 'dd. MMMM yyyy', { locale: de })}
                          </strong>
                        </span>
                      ) : (
                        <span>Kostenloser Basis-Tarif</span>
                      )}
                    </div>
                  ) : pKey !== 'STANDARD' ? (
                    <Button
                      type="button"
                      variant={pKey === 'PRO' ? 'primary' : 'secondary'}
                      size="sm"
                      fullWidth
                      onClick={() => {
                        onClose();
                        onOpenActivation();
                      }}
                      icon={<KeyRound className="w-3.5 h-3.5" />}
                    >
                      {isHigher ? 'Bereits enthalten' : 'Code einlösen'}
                    </Button>
                  ) : (
                    <div className="text-center text-[11px] text-gray-400 font-medium py-1">
                      Automatisch für jeden Account
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-ios-dark-secondary dark:to-ios-dark-tertiary flex flex-col sm:flex-row items-center justify-between gap-3 border border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ios-blue text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Du hast einen Lizenzcode erhalten?
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Gib deinen Code ein, um Plus oder Pro sofort für deinen Account zu aktivieren.
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenActivation();
            }}
            icon={<KeyRound className="w-3.5 h-3.5" />}
          >
            Code jetzt einlösen
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

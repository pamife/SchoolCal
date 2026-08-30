import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import type { FeatureKey } from '../../config/features';
import { PLAN_INFO } from '../../config/features';
import { Lock, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';
import { PremiumBadge } from './PremiumBadge';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onOpenPricing?: () => void;
  onOpenActivation?: () => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallbackTitle,
  fallbackDescription,
  onOpenPricing,
  onOpenActivation,
}) => {
  const { hasFeature, getRequiredPlan } = useSubscription();

  const isAllowed = hasFeature(feature);
  const requiredPlan = getRequiredPlan(feature);
  const planInfo = PLAN_INFO[requiredPlan];

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="ios-card p-6 border border-dashed border-black/10 dark:border-white/15 bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-ios-dark-secondary/30 dark:to-ios-dark-secondary/60 text-center space-y-4">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
        <Lock className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2">
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            {fallbackTitle || 'Premium-Funktion'}
          </h4>
          <PremiumBadge plan={requiredPlan} size="sm" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {fallbackDescription ||
            `Diese Funktion steht im ${planInfo.name}-Tarif zur Verfügung. Löse deinen Lizenzcode ein, um sie freizuschalten.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {onOpenActivation && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenActivation}
            icon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
          >
            Lizenzcode einlösen
          </Button>
        )}
        {onOpenPricing && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenPricing}
          >
            Tarife ansehen
          </Button>
        )}
      </div>
    </div>
  );
};

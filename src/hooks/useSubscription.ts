import { useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { UserPlan } from '../types';
import {
  isPlanEligible,
  getRequiredPlanForFeature,
  PLAN_INFO,
  type FeatureKey,
  type PlanMeta,
} from '../config/features';

export interface SubscriptionState {
  plan: UserPlan;
  planInfo: PlanMeta;
  isStandard: boolean;
  isPlus: boolean;
  isPro: boolean;
  isAdmin: boolean;
  expiresAt: string | null;
  isLifetime: boolean;
  planSource: string;
  hasPlan: (requiredPlan: UserPlan) => boolean;
  hasFeature: (feature: FeatureKey) => boolean;
  getRequiredPlan: (feature: FeatureKey) => UserPlan;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuthStore();

  const plan: UserPlan = user?.plan || 'STANDARD';
  const isAdmin = user?.role === 'admin';
  const expiresAt = user?.planExpiresAt || null;
  const isLifetime = plan !== 'STANDARD' && !expiresAt;
  const planSource = user?.planSource || 'FREE';

  return useMemo(() => {
    return {
      plan,
      planInfo: PLAN_INFO[plan] || PLAN_INFO.STANDARD,
      isStandard: plan === 'STANDARD',
      isPlus: isPlanEligible(plan, 'PLUS'),
      isPro: isPlanEligible(plan, 'PRO'),
      isAdmin,
      expiresAt,
      isLifetime,
      planSource,
      hasPlan: (requiredPlan: UserPlan) => isPlanEligible(plan, requiredPlan),
      hasFeature: (feature: FeatureKey) => isPlanEligible(plan, getRequiredPlanForFeature(feature)),
      getRequiredPlan: (feature: FeatureKey) => getRequiredPlanForFeature(feature),
    };
  }, [plan, isAdmin, expiresAt, isLifetime, planSource]);
}

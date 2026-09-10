import { lazy, Suspense, useEffect, useState } from 'react';
import { LandingPage } from './components/landing/LandingPage';

const SchoolCalApp = lazy(() => import('./App'));

type StandaloneNavigator = Navigator & {
  standalone?: boolean;
};

const getStandaloneState = () => {
  if (typeof window === 'undefined') return false;

  const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as StandaloneNavigator).standalone === true;

  return displayModeStandalone || iosStandalone;
};

const isAppPath = () => {
  if (typeof window === 'undefined') return false;
  return /^\/app(?:\/|$)/.test(window.location.pathname);
};

function AppLoadingFallback() {
  return (
    <div
      className="flex h-dvh w-full flex-col items-center justify-center bg-ios-light-bg text-slate-900 dark:bg-ios-dark-bg dark:text-white"
      role="status"
      aria-label="SchoolCal wird geladen"
    >
      <img src="/icon.svg" alt="" className="mb-4 h-16 w-16 rounded-[14px]" />
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" />
    </div>
  );
}

export function Root() {
  const [isStandalone, setIsStandalone] = useState(getStandaloneState);

  useEffect(() => {
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const updateStandaloneState = () => setIsStandalone(getStandaloneState());

    displayModeQuery.addEventListener?.('change', updateStandaloneState);

    return () => {
      displayModeQuery.removeEventListener?.('change', updateStandaloneState);
    };
  }, []);

  if (isAppPath() || isStandalone) {
    return (
      <Suspense fallback={<AppLoadingFallback />}>
        <SchoolCalApp />
      </Suspense>
    );
  }

  return <LandingPage />;
}

export default Root;

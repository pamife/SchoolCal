import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in SchoolCal:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-ios-light-bg dark:bg-ios-dark-bg text-slate-900 dark:text-white select-none">
          <div className="ios-card max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Ein Fehler ist aufgetreten
            </h2>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Die App konnte leider nicht ordnungsgemäß geladen werden. Bitte lade die Seite neu.
            </p>

            {this.state.error && (
              <div className="p-3 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-left text-xs font-mono text-red-600 dark:text-red-400 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => window.location.reload()}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Seite neu laden
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

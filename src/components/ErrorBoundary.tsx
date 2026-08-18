import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-8 bg-heritage-dark text-gold-100 rounded-2xl border border-red-500/40 text-center max-w-lg mx-auto my-8 space-y-4">
          <h2 className="text-xl font-bold text-red-400">⚠️ कुछ त्रुटि हुई (Something went wrong)</h2>
          <p className="text-xs text-gray-300 font-mono bg-black/40 p-3 rounded-lg overflow-auto max-h-32 text-left">
            {this.state.error?.toString()}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-6 py-2 bg-heritage-red hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
          >
            मुख्य पृष्ठ पर वापस जाएं (Back to Home)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

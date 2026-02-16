import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Ошибка приложения:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Произошла ошибка
          </h2>
          <p className="text-gray-600 mb-4">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

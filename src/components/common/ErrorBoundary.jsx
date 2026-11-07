
import React from 'react';
import ErrorState from './ErrorState';

/**
 * Catches JavaScript render errors so one broken component
 * does not turn the whole page white.
 *
 * <ErrorBoundary>              -> full page fallback
 * <ErrorBoundary compact>      -> small fallback for a single section
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleRetry = () => {
    if (this.props.compact) {
      // Re-render only this section
      this.setState({ hasError: false, error: null });
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          kind="generic"
          error={this.state.error}
          compact={this.props.compact}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
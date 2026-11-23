import { Component } from 'react';

// React only supports error boundaries as class components
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps, prevState) {
    // Checking prevState keeps an error thrown by the navigation itself from
    // being cleared straight away
    if (
      this.state.hasError &&
      prevState.hasError &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.reset();
    }
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className='error-boundary' role='alert'>
        <h1>Something went wrong</h1>
        <p>This page ran into an unexpected problem.</p>
        <button type='button' onClick={this.reset}>
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;

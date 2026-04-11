'use client';

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'var(--color-error)' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.message}</p>
          <button onClick={() => this.setState({ hasError: false, message: '' })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

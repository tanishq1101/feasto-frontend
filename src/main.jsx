import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { StoreContextProvider } from './context/StoreContext.jsx';
import { ClerkProvider } from '@clerk/clerk-react';

// --- ROOT ERROR BOUNDARY FOR ROBUST CRASH CAPTURE ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught a runtime crash:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'Outfit, sans-serif',
          background: '#fff5f5',
          color: '#c53030',
          borderRadius: '12px',
          border: '1px solid #feb2b2',
          maxWidth: '600px',
          margin: '50px auto',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#e53e3e' }}>Something went wrong</h2>
          <p style={{ fontWeight: '600', margin: '0 0 20px 0', color: '#2d3748' }}>{this.state.error?.toString()}</p>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '13px', background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #edf2f7', color: '#4a5568' }}>
            {this.state.errorInfo?.componentStack || this.state.error?.stack}
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Gracefully handle missing env keys by rendering visual instructions
if (!PUBLISHABLE_KEY) {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 40px; fontFamily: Outfit, sans-serif; background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; border-radius: 12px; max-width: 600px; margin: 50px auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h2 style="margin: 0 0 10px 0; color: #e53e3e;">Vite Environment Cache Out-of-Sync</h2>
        <p style="color: #4a5568; line-height: 1.6;">The Clerk Publishable Key is not loaded. If you recently configured or updated the <code>.env</code> file, <strong>please stop and restart your Vite development server</strong> in the terminal so it reads the new variables.</p>
        <div style="margin-top: 15px; padding: 10px; background: #edf2f7; border-radius: 6px; font-family: monospace; font-size: 13px; color: #2d3748;">
          Ctrl + C<br/>
          npm run dev
        </div>
      </div>
    `;
  }
  throw new Error('Missing Clerk Publishable Key. Please restart Vite.');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <BrowserRouter>
          <StoreContextProvider>
            <App />
          </StoreContextProvider>
        </BrowserRouter>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SafeClerkProvider from './components/SafeClerkProvider';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

// Clerk Publishable Key (Configured in .env via VITE_CLERK_PUBLISHABLE_KEY)
const CLERK_PUBLISHABLE_KEY =
  ((import.meta as any).env && (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY) ||
  'pk_test_bXV0dWFsLWNoYW1vaXMtOTU0Ny5jbGVyay5hY2NvdW50cy5kZXYk';

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn("Missing VITE_CLERK_PUBLISHABLE_KEY in environment configuration.");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <SafeClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <LanguageProvider>
          <DataProvider>
            <ToastProvider>
              <CartProvider>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </CartProvider>
            </ToastProvider>
          </DataProvider>
        </LanguageProvider>
      </SafeClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
import React, { createContext, useContext, useMemo, useState, useEffect, Component, ReactNode } from 'react';
import { ClerkProvider, ClerkLoaded, ClerkLoading, useAuth, useUser, useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';
import SplashScreen from './SplashScreen';
import ErrorScreen from './ErrorScreen';

export interface ClerkBridgeType {
  isClerkLoaded: boolean;
  isSignedIn: boolean;
  clerkUserId: string | null;
  getToken: (options?: any) => Promise<string | null>;
  clerkUser: any;
  signOut: () => Promise<void>;
  signIn: any;
  isSignInLoaded: boolean;
  signUp: any;
  isSignUpLoaded: boolean;
  clerkAvailable: boolean;
}

const defaultUnloadedBridge: ClerkBridgeType = {
  isClerkLoaded: false,
  isSignedIn: false,
  clerkUserId: null,
  getToken: async () => null,
  clerkUser: null,
  signOut: async () => {},
  signIn: null,
  isSignInLoaded: false,
  signUp: null,
  isSignUpLoaded: false,
  clerkAvailable: false,
};

export const ClerkBridgeContext = createContext<ClerkBridgeType>(defaultUnloadedBridge);

export const useSafeClerk = (): ClerkBridgeType => useContext(ClerkBridgeContext);

/**
 * ClerkBridgeConsumer
 * Connects official Clerk hooks to ClerkBridgeContext.
 * Only executes when Clerk is fully loaded by @clerk/clerk-react.
 */
const ClerkBridgeConsumer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  const value = useMemo<ClerkBridgeType>(() => ({
    isClerkLoaded: auth.isLoaded,
    isSignedIn: !!auth.isSignedIn,
    clerkUserId: auth.userId ?? null,
    getToken: (opts?: any) => auth.getToken(opts),
    clerkUser: user,
    signOut: () => clerk.signOut(),
    signIn,
    isSignInLoaded,
    signUp,
    isSignUpLoaded,
    clerkAvailable: true,
  }), [auth.isLoaded, auth.isSignedIn, auth.userId, user, clerk, signIn, isSignInLoaded, signUp, isSignUpLoaded]);

  return (
    <ClerkBridgeContext.Provider value={value}>
      {children}
    </ClerkBridgeContext.Provider>
  );
};

interface Props {
  publishableKey: string;
  children: React.ReactNode;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ClerkErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[ClerkDiagnostics] SDK loading failed or was blocked by browser:', error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

/**
 * SafeClerkProvider
 * Wraps official @clerk/clerk-react ClerkProvider.
 * Provides branded splash loading and friendly error states without technical jargon.
 * Strictly forbids any authentication bypass or mock data.
 */
export const SafeClerkProvider: React.FC<Props> = ({ publishableKey, children }) => {
  const [timedOut, setTimedOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // If Clerk does not load within 6 seconds (e.g. offline or CDN blocked),
    // display the friendly error screen.
    const timer = setTimeout(() => {
      const isLoaded = !!(window as any).Clerk?.loaded;
      if (!isLoaded) {
        console.warn('[ClerkDiagnostics] Clerk loading timed out after 6000ms');
        setTimedOut(true);
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  if (timedOut || errorMessage) {
    return <ErrorScreen onRetry={() => window.location.reload()} />;
  }

  return (
    <ClerkErrorBoundary fallback={err => {
      console.error('[ClerkDiagnostics] Caught initialization error:', err);
      return <ErrorScreen onRetry={() => window.location.reload()} />;
    }}>
      <ClerkProvider
        publishableKey={publishableKey}
        onError={err => {
          console.error('[ClerkDiagnostics] ClerkProvider onError:', err);
          setErrorMessage(err?.message || 'Failed to initialize Clerk');
        }}
      >
        <ClerkLoading>
          <SplashScreen />
        </ClerkLoading>
        <ClerkLoaded>
          <ClerkBridgeConsumer>
            {children}
          </ClerkBridgeConsumer>
        </ClerkLoaded>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
};

export default SafeClerkProvider;

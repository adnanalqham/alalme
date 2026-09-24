import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    (window as any).__LAST_ERROR__ = { error, errorInfo };
    try {
      fetch('/api/v1/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'React.ErrorBoundary',
          message: error?.message || String(error),
          stack: error?.stack || '',
          componentStack: errorInfo?.componentStack || '',
          url: window.location.href,
        }),
      });
    } catch {
      // ignore
    }
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/#/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-lg w-full shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold">
              !
            </div>
            
            <h1 className="text-xl font-black text-[#010736]">
              حدث خطأ أثناء تحميل لوحة التحكم
            </h1>

            <p className="text-xs text-slate-500 leading-relaxed">
              حدث استثناء غير معالج في واجهة المتصفح. يمكنك إعادة تحميل الصفحة أو إعادة ضبط الذاكرة المحلية المؤقتة.
            </p>

            {this.state.error && (
              <div className="bg-slate-900 text-amber-300 p-3 rounded-xl text-xs font-mono text-left overflow-x-auto max-h-40" dir="ltr">
                <div className="font-bold text-rose-400">{this.state.error.name}: {this.state.error.message}</div>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-slate-400 mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-[#010736] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                إعادة تحميل الصفحة
              </button>
              <button
                onClick={this.handleResetStorage}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
              >
                مسح الذاكرة المؤقتة والبدء
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

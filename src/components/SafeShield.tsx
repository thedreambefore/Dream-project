// src/components/SafeShield.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export class SafeShield extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔒 夢沙防護網攔截到底層錯誤:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="space-bg min-h-screen text-white p-12 text-center flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-amber-200 mb-2">星空微光調校中</h1>
          <p className="text-gray-400 text-xs mb-4">系統攔截到底層加載異常，請嘗試重新載入。</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-xl text-xs hover:bg-amber-500/30 cursor-pointer"
          >
            重新連結星空
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Sparkles } from 'lucide-react';

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
    console.error('VISTA Uncaught Application Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-rose-500/30">
          <div className="relative max-w-lg w-full p-8 rounded-3xl bg-slate-950/90 border border-rose-500/30 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center space-y-6">
            {/* Glowing Avatar Glitch Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-xl shadow-rose-500/20 animate-pulse">
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-rose-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-slate-800 border border-rose-500/40 text-[10px] font-mono text-rose-300">
                Glitch Handled
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Nova Encountered a Hiccup
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                An unexpected interface anomaly occurred. Your saved memories, taste profile, and settings in the local database remain completely intact.
              </p>
            </div>

            {/* Technical Detail Collapsible */}
            {this.state.error && (
              <div className="w-full text-left bg-slate-900/80 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Diagnostics:
                </span>
                <p className="text-xs font-mono text-rose-300 truncate">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Recovery Action Buttons */}
            <div className="flex items-center space-x-3 w-full pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recover Companion</span>
              </button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex items-center justify-center space-x-1.5 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Watch Room</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

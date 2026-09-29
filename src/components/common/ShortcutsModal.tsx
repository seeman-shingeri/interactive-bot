import React from 'react';
import { Keyboard, X, Sparkles, MessageSquare, Download, Volume2, Shield } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  botName: string;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  botName,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      key: 'C',
      description: `Toggle companion dialogue with ${botName}`,
      icon: <MessageSquare className="w-4 h-4 text-cyan-400" />,
    },
    {
      key: 'D',
      description: 'Open standalone companion download hub',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'M',
      description: 'Toggle companion voice mute / unmute',
      icon: <Volume2 className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'Esc',
      description: 'Close active drawer, modal, or radial menu',
      icon: <X className="w-4 h-4 text-rose-400" />,
    },
    {
      key: 'Hold 2s',
      description: 'Press & hold companion to bloom 10-node radial menu',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    },
    {
      key: 'Click Face',
      description: `Click ${botName}'s visor to open companion drawer`,
      icon: <Shield className="w-4 h-4 text-cyan-300" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-slate-400">
                Quick commands for controlling {botName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center space-x-2.5 text-xs text-slate-200">
                {s.icon}
                <span>{s.description}</span>
              </div>
              <kbd className="px-2 py-1 rounded-lg bg-slate-800 border border-white/15 text-[11px] font-mono font-bold text-cyan-300 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
          Shortcuts are active whenever text inputs are not focused.
        </div>
      </div>
    </div>
  );
};

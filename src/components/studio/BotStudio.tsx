import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Volume2,
  Palette,
  Bot,
  MessageSquare,
  Check,
  RotateCcw,
  Zap,
  Smile,
  Shield,
  Layers,
  Download,
} from 'lucide-react';
import { BotSettings, BotPersonalityPreset } from '../../types/index.js';
import { speechService } from '../../services/speech.js';

interface BotStudioProps {
  botSettings: BotSettings;
  onSaveBotSettings: (settings: BotSettings) => Promise<void>;
  onTestVoice: (text: string, settings: BotSettings) => void;
}

export const BotStudio: React.FC<BotStudioProps> = ({
  botSettings,
  onSaveBotSettings,
  onTestVoice,
}) => {
  const [form, setForm] = useState<BotSettings>({ ...botSettings });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [previewEmotion, setPreviewEmotion] = useState<string>('watching');

  useEffect(() => {
    setForm({ ...botSettings });
  }, [botSettings]);

  useEffect(() => {
    setAvailableVoices(speechService.getVoices());
  }, []);

  const handleChange = (key: keyof BotSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onSaveBotSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const personalities: { preset: BotPersonalityPreset; desc: string }[] = [
    { preset: 'Friendly', desc: 'Warm, encouraging, and supportive companion.' },
    { preset: 'Funny', desc: 'Quick-witted, comedic timing, loves chuckling at funny scenes.' },
    { preset: 'Calm', desc: 'Zen, soothing, relaxed voice and quiet presence.' },
    { preset: 'Curious', desc: 'Constantly fascinated by visual details, sets, and props.' },
    { preset: 'Enthusiastic', desc: 'High energy, gets visibly excited during climaxes.' },
    { preset: 'Analytical', desc: 'Notices cinematography, lighting, framing, and pacing.' },
    { preset: 'Sarcastic', desc: 'Playful dry humor, witty commentary, and banter.' },
    { preset: 'Supportive', desc: 'Empathetic, attentive, validates your emotional reactions.' },
    { preset: 'Custom', desc: 'Completely defined by your custom prompt below.' },
  ];

  const colorThemes: { id: BotSettings['avatarColor']; name: string; hex: string }[] = [
    { id: 'cyan', name: 'Nova Cyan', hex: '#00d2ff' },
    { id: 'purple', name: 'Nebula Violet', hex: '#9d4edd' },
    { id: 'gold', name: 'Solar Amber', hex: '#ffd166' },
    { id: 'emerald', name: 'Matrix Emerald', hex: '#06d6a0' },
    { id: 'rose', name: 'Cyber Rose', hex: '#f72585' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
              Companion Architect
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bot Studio: Meet Your Companion
          </h1>
          <p className="text-sm text-slate-300">
            Customize {form.name}'s identity, emotional range, voice, and physical dock style.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/download/bot"
            download="vista-companion.html"
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 hover:border-cyan-400/50 text-slate-200 hover:text-white font-semibold text-sm shadow-lg transition-all active:scale-95"
            title="Download standalone companion application"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Download Standalone Bot</span>
            <span className="sm:hidden">Download</span>
          </a>

          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all active:scale-95"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSaved ? 'Companion Saved!' : 'Save Companion'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Companion Preview */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-3 left-4 text-xs font-mono text-slate-400">
              LIVE PREVIEW
            </div>

            {/* Preview Box */}
            <div className="w-full h-56 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
              <div
                style={{
                  boxShadow: `0 0 40px ${colorThemes.find((c) => c.id === form.avatarColor)?.hex}33`,
                }}
                className="w-28 h-28 rounded-3xl bg-slate-900 border-2 border-cyan-400/50 flex flex-col items-center justify-center p-3 animate-float transition-all"
              >
                {/* Antenna */}
                <div className="w-12 flex justify-between px-1 mb-2">
                  <div className="w-2 h-1 bg-cyan-400 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <div className="w-2 h-1 bg-cyan-400 rounded-full" />
                </div>
                {/* Eyes */}
                <div className="w-20 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center space-x-3">
                  <div
                    style={{
                      backgroundColor: colorThemes.find((c) => c.id === form.avatarColor)?.hex,
                    }}
                    className="w-3.5 h-5 rounded-full shadow-lg animate-pulse"
                  />
                  <div
                    style={{
                      backgroundColor: colorThemes.find((c) => c.id === form.avatarColor)?.hex,
                    }}
                    className="w-3.5 h-5 rounded-full shadow-lg animate-pulse"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-300 font-bold mt-2">
                  {form.name}
                </span>
              </div>
            </div>

            {/* Test Voice Button */}
            <button
              onClick={() =>
                onTestVoice(
                  `Hey there! I'm ${form.name}. Ready to watch something amazing together?`,
                  form
                )
              }
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-white/10 transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Voice Greeting</span>
            </button>
          </div>

          {/* Docking & Physical Attributes */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Position & Viewport Dock
            </h3>

            {/* Position */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Docking Anchor</label>
              <div className="grid grid-cols-2 gap-2">
                {(['right', 'left', 'bottom-corner', 'floating'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => handleChange('position', pos)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border capitalize transition-all ${
                      form.position === pos
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Scale / Size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleChange('size', s)}
                    className={`py-1.5 rounded-xl text-xs font-medium border capitalize transition-all ${
                      form.size === s
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Transparency</span>
                <span className="font-mono text-cyan-300">{Math.round(form.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={form.opacity}
                onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Personality, Voice, Instructions */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* Identity & Personality */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-5 shadow-xl">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Identity & Personality Presets
              </h3>
            </div>

            {/* Bot Name and Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Companion Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Color Themes */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Visual Aura</label>
                <div className="flex items-center space-x-2 pt-1">
                  {colorThemes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleChange('avatarColor', c.id)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        form.avatarColor === c.id
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Personality Presets Grid (Requirement 2) */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Personality Preset</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {personalities.map((p) => (
                  <button
                    key={p.preset}
                    type="button"
                    onClick={() => handleChange('personality', p.preset)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      form.personality === p.preset
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{p.preset}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {p.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instructions (Requirement 2) */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">
                Custom Personality Instructions
              </label>
              <textarea
                rows={3}
                value={form.customInstructions}
                onChange={(e) => handleChange('customInstructions', e.target.value)}
                placeholder="e.g. You are curious, funny and slightly sarcastic. Don't talk too much. React mainly to interesting scenes."
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>
          </div>

          {/* Emotional Dynamics & Sliders (Requirement 2) */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
              <Sliders className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Behavioral & Reaction Dynamics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Talkativeness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Talkativeness</span>
                  <span className="font-mono text-cyan-300">{form.talkativeness} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.talkativeness}
                  onChange={(e) => handleChange('talkativeness', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Humor Level */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Humor Level</span>
                  <span className="font-mono text-cyan-300">{form.humorLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.humorLevel}
                  onChange={(e) => handleChange('humorLevel', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Energy Level */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Energy Level</span>
                  <span className="font-mono text-cyan-300">{form.energyLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.energyLevel}
                  onChange={(e) => handleChange('energyLevel', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Emotional Expressiveness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Emotional Expressiveness</span>
                  <span className="font-mono text-cyan-300">{form.expressiveness} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.expressiveness}
                  onChange={(e) => handleChange('expressiveness', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Reaction Frequency (Requirement 6) */}
            <div className="pt-2 space-y-1.5">
              <label className="text-xs text-slate-400">Reaction Frequency</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Low', 'Balanced', 'High', 'Custom'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => handleChange('reactionFrequency', freq)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      form.reactionFrequency === freq
                        ? 'bg-purple-600/30 border-purple-400 text-purple-300'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice & Speech Synthesis (Requirement 17) */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Voice & Speech Engine
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Voice toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-xs font-semibold text-white">Voice Speech Responses</span>
                <input
                  type="checkbox"
                  checked={form.voiceEnabled}
                  onChange={(e) => handleChange('voiceEnabled', e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Voice select */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Synthesizer Voice</label>
                <select
                  value={form.voiceVoiceURI || ''}
                  onChange={(e) => handleChange('voiceVoiceURI', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Default Friendly Voice</option>
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Speaking Speed</span>
                  <span className="font-mono text-cyan-300">{form.voiceSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={form.voiceSpeed}
                  onChange={(e) => handleChange('voiceSpeed', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Pitch slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Speaking Pitch</span>
                  <span className="font-mono text-cyan-300">{form.voicePitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={form.voicePitch}
                  onChange={(e) => handleChange('voicePitch', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Companion Visual Theme Presets
 * Defines color palettes, glows, aura effects, and eye styles for Nova.
 */

export interface CompanionTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentGlow: string;
  visorBg: string;
  eyeColor: string;
  tagline: string;
}

export const COMPANION_THEMES: CompanionTheme[] = [
  {
    id: 'cyan',
    name: 'Nova Cyan',
    primaryColor: '#00f0ff',
    secondaryColor: '#3b82f6',
    accentGlow: 'rgba(0, 240, 255, 0.4)',
    visorBg: '#020617',
    eyeColor: '#00f0ff',
    tagline: 'Standard issue futuristic AI companion aesthetics.',
  },
  {
    id: 'purple',
    name: 'Nebula Violet',
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    accentGlow: 'rgba(168, 85, 247, 0.45)',
    visorBg: '#0f051d',
    eyeColor: '#c084fc',
    tagline: 'Deep space cosmic aura with violet pupil glow.',
  },
  {
    id: 'gold',
    name: 'Solar Amber',
    primaryColor: '#f59e0b',
    secondaryColor: '#ef4444',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    visorBg: '#1c0f02',
    eyeColor: '#fbbf24',
    tagline: 'Warm cinematic sunset tones for relaxed viewing.',
  },
  {
    id: 'emerald',
    name: 'Matrix Emerald',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
    visorBg: '#021810',
    eyeColor: '#34d399',
    tagline: 'High-contrast synthetic terminal emerald pulse.',
  },
  {
    id: 'rose',
    name: 'Cyber Rose',
    primaryColor: '#f43f5e',
    secondaryColor: '#8b5cf6',
    accentGlow: 'rgba(244, 63, 94, 0.45)',
    visorBg: '#1f040d',
    eyeColor: '#fb7185',
    tagline: 'Vibrant cyberpunk neon magenta illumination.',
  },
  {
    id: 'obsidian',
    name: 'Void Obsidian',
    primaryColor: '#e2e8f0',
    secondaryColor: '#64748b',
    accentGlow: 'rgba(226, 232, 240, 0.25)',
    visorBg: '#050505',
    eyeColor: '#ffffff',
    tagline: 'Ultra-clean minimalist monochrome styling.',
  },
];

export const getThemeById = (id: string): CompanionTheme => {
  return COMPANION_THEMES.find((t) => t.id === id) || COMPANION_THEMES[0];
};

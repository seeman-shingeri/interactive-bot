/**
 * VISTA Color & Lighting Utilities
 * Helpers for Ambilight dynamic glows, luminance calculation, and contrast verification.
 */

export function hexToRgba(hex: string, alpha: number = 1): string {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((char) => char + char).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function calculateLuminance(r: number, g: number, b: number): number {
  return 0.299 * (r / 255) + 0.587 * (g / 255) + 0.114 * (b / 255);
}

export function getDominantMoodColor(genres: string[]): string {
  if (genres.includes('Sci-Fi')) return '#00d2ff';
  if (genres.includes('Cyberpunk') || genres.includes('Action')) return '#f72585';
  if (genres.includes('Documentary') || genres.includes('Nature')) return '#06d6a0';
  if (genres.includes('Comedy') || genres.includes('Animation')) return '#ffd166';
  return '#9d4edd';
}

export function getAmbilightBoxShadow(dominantHex: string, intensity: number = 0.25): string {
  return `0 20px 70px -15px ${hexToRgba(dominantHex, intensity)}`;
}

'use client';

// Deterministic gradient palette for category titles
export const gradientPalette = [
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ef4444', // red
  '#22d3ee', // sky/cyan-light
  '#a3e635', // lime-light
  '#eab308'  // yellow
];

export const hashString = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getCategoryGradient = (id: string): { left: string; right: string } => {
  const base = hashString(id);
  const leftIdx = base % gradientPalette.length;
  let rightIdx = (base * 7 + 3) % gradientPalette.length;
  if (rightIdx === leftIdx) rightIdx = (rightIdx + 1) % gradientPalette.length;
  const left = gradientPalette[leftIdx];
  const right = gradientPalette[rightIdx];
  return { left, right };
};




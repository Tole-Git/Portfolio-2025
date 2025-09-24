'use client';

// Neon color classes for tags
export const neonColors = [
  'tag-neon-emerald',
  'tag-neon-purple',
  'tag-neon-blue',
  'tag-neon-amber',
  'tag-neon-cyan',
  'tag-neon-lime',
  'tag-neon-red',
  'tag-neon-indigo'
];

// Function to get consistent color for a tag based on its text
export const getTagColor = (tagText: string): string => {
  const index = tagText
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % neonColors.length;
  return neonColors[index];
};

// Explicit tag style mapping for Projects & Skills sections
export const tagStyleMap: Record<string, string> = {
  // Programming Languages
  'python': 'tag-neon-amber',
  'javascript': 'tag-neon-amber',
  'typescript': 'tag-neon-blue',
  'java': 'tag-neon-red',
  'sql': 'tag-neon-indigo',

  // Runtimes / Platforms
  'node.js': 'tag-neon-lime',
  'nodejs': 'tag-neon-lime',

  // Frameworks & Libraries
  'react': 'tag-neon-cyan',
  'streamlit': 'tag-neon-red',
  'express': 'tag-neon-purple',
  'jquery': 'tag-neon-blue',

  // AI/ML & Cloud Services
  'openai api': 'tag-neon-emerald',
  'azure openai': 'tag-neon-blue',
  'google gemini': 'tag-neon-indigo',
  'gemini api': 'tag-neon-indigo',
  'twilio': 'tag-neon-red',
  'google cloud speech': 'tag-neon-cyan',
  'ai/ml apis': 'tag-neon-purple',

  // Concepts / Techniques
  'rag': 'tag-neon-amber',
  'vector search': 'tag-neon-amber',
  'mcp protocol': 'tag-neon-purple',
  'document processing': 'tag-neon-blue'
};

// Prefer explicit mapping when available; fallback to deterministic color
export const getTagClass = (tagText: string): string => {
  const key = tagText.trim().toLowerCase();
  return tagStyleMap[key] ?? getTagColor(tagText);
};




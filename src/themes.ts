export interface Theme {
  name: string;
  vars: Record<string, string>;
}

export const builtInThemes: Theme[] = [
  {
    name: 'Light',
    vars: {
      '--bg': '#ffffff',
      '--text': '#1f2937',
    },
  },
  {
    name: 'Dark',
    vars: {
      '--bg': '#1f2937',
      '--text': '#f9fafb',
    },
  },
  {
    name: 'Midnight',
    vars: {
      '--bg': '#0f172a',
      '--text': '#e0f2fe',
    },
  },
];

export function applyTheme(vars: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}

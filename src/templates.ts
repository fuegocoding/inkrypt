export interface Template {
  name: string
  content: string
}

export const templates: Template[] = [
  {
    name: 'Daily Log',
    content: `# {{date}}\n\n## Mood\n\n## Thoughts\n`
  },
  {
    name: 'Gratitude',
    content: `# Gratitude Journal\n\n- I'm grateful for...\n- \n`
  }
]

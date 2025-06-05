import { extractWikiLinks } from './utils'
import type { Note } from './db'

interface Props {
  notes: Note[]
  onOpen: (title: string) => void
}

export default function GraphView({ notes, onOpen }: Props) {
  const titles = Array.from(new Set(notes.map((n) => n.title)))
  const edges: { source: string; target: string }[] = []
  for (const n of notes) {
    for (const t of extractWikiLinks(n.content)) {
      edges.push({ source: n.title, target: t })
      if (!titles.includes(t)) titles.push(t)
    }
  }
  const radius = 150
  const centerX = 200
  const centerY = 200
  const positions = titles.map((title, i) => {
    const angle = (2 * Math.PI * i) / titles.length
    return { title, x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) }
  })
  const posMap = new Map(positions.map((p) => [p.title, p]))

  return (
    <svg width={400} height={400} className="border bg-white dark:bg-gray-800">
      {edges.map((e, i) => {
        const s = posMap.get(e.source)
        const t = posMap.get(e.target)
        if (!s || !t) return null
        return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#94a3b8" />
      })}
      {positions.map((p) => (
        <g key={p.title} onClick={() => onOpen(p.title)} className="cursor-pointer">
          <circle cx={p.x} cy={p.y} r={10} fill="#1e40af" />
          <text x={p.x + 12} y={p.y + 4} fontSize={12} className="fill-black dark:fill-white">
            {p.title}
          </text>
        </g>
      ))}
    </svg>
  )
}

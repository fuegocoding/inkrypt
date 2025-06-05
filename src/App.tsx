import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNotes } from './store'
import './App.css'

export default function App() {
  const { notes, load, add, remove } = useNotes()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Notes</h2>
        <ul>
          {notes.map((n) => (
            <li key={n.id} onClick={() => { setTitle(n.title); setContent(n.content) }}>
              {n.title} <button onClick={(e) => { e.stopPropagation(); remove(n.id!) }}>x</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="editor">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
        />
        <button onClick={() => { add(title, content); setTitle(''); setContent(''); }}>
          Save
        </button>
        <h3>Preview</h3>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNotes } from './store'
import { initKey } from './crypto'

export default function App() {
  const { notes, load, add, remove } = useNotes()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (unlocked) {
      load()
    }
  }, [load, unlocked])

  const handleUnlock = async () => {
    const ok = await initKey(passphrase)
    if (ok) {
      setUnlocked(true)
      setPassphrase('')
      setError('')
    } else {
      setError('Incorrect passphrase')
    }
  }

  if (!unlocked) {
    return (
      <div className="flex flex-col gap-2 m-8">
        <h2>Enter Passphrase</h2>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="border p-2"
        />
        <button onClick={handleUnlock} className="self-start px-3 py-1 border rounded">
          Unlock
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex gap-4 p-4 font-sans">
      <div className="w-48 border-r border-gray-300">
        <h2>Notes</h2>
        <ul className="list-none p-0">
          {notes.map((n) => (
            <li
              key={n.id}
              onClick={() => {
                setTitle(n.title)
                setContent(n.content)
              }}
              className="cursor-pointer py-1"
            >
              {n.title}{' '}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  remove(n.id!)
                }}
                className="ml-2 px-1 text-sm border rounded"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="border p-2 font-mono"
        />
        <button
          onClick={() => {
            add(title, content)
            setTitle('')
            setContent('')
          }}
          className="self-start px-3 py-1 border rounded"
        >
          Save
        </button>
        <h3>Preview</h3>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

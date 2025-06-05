import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNotes } from './store'
import { initKey } from './crypto'
import GraphView from './GraphView'
import { markdownWithWikiLinks } from './utils'

export default function App() {
  const { notes, load, add, update, remove } = useNotes()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [folder, setFolder] = useState(0)
  const [tagsInput, setTagsInput] = useState('')
  const [selectedFolder, setSelectedFolder] = useState(-1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [showGraph, setShowGraph] = useState(false)

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

  const resetEditor = () => {
    setTitle('')
    setContent('')
    setFolder(0)
    setTagsInput('')
    setSelectedId(null)
  }

  const openNoteByTitle = (t: string) => {
    const note = notes.find((n) => n.title === t)
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setFolder(note.folderId ?? 0)
      setTagsInput(note.tags.join(' '))
      setSelectedId(note.id ?? null)
    } else {
      setTitle(t)
      setContent('')
      setFolder(0)
      setTagsInput('')
      setSelectedId(null)
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
    <div className="min-h-screen flex flex-col font-sans">
      <header className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 shadow">
        <h1 className="font-bold">Inkrypt</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowGraph((v) => !v)} className="px-2 py-1 border rounded bg-blue-800">
            {showGraph ? 'Hide Graph' : 'Graph'}
          </button>
          <button onClick={resetEditor} className="px-2 py-1 border rounded bg-blue-800">New Note</button>
        </div>
      </header>
      <div className="flex flex-1 gap-4 p-4">
      <div className="w-48 border-r border-gray-300">
        <h2>Notes</h2>
        <select
          className="mb-2 border p-1 w-full"
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(Number(e.target.value))}
        >
          <option value={-1}>All Folders</option>
          {Array.from(new Set(notes.map((n) => n.folderId ?? 0))).map((f) => (
            <option key={f} value={f}>
              Folder {f}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search..."
          className="mb-2 border p-1 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="list-none p-0">
          {notes
            .filter((n) =>
              (selectedFolder === -1 || n.folderId === selectedFolder) &&
              n.title.toLowerCase().includes(search.toLowerCase())
            )
            .map((n) => (
              <li
                key={n.id}
                onClick={() => {
                  setTitle(n.title)
                  setContent(n.content)
                  setFolder(n.folderId ?? 0)
                  setTagsInput(n.tags.join(' '))
                  setSelectedId(n.id!)
                }}
                className="cursor-pointer py-1 hover:underline"
              >
                {n.title} (f{n.folderId})
                {n.tags.length > 0 && (
                  <span className="text-xs text-gray-500 ml-1">[{n.tags.join(', ')}]</span>
                )}
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
        <input
          type="number"
          placeholder="Folder"
          value={folder}
          onChange={(e) => setFolder(Number(e.target.value))}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="border p-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="border p-2 font-mono"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              const tags = tagsInput.split(' ').filter(Boolean)
              if (selectedId === null) {
                add(title, content, folder, tags)
              } else {
                update(selectedId, title, content, folder, tags)
              }
              resetEditor()
            }}
            className="px-3 py-1 border rounded bg-blue-600 text-white"
          >
            {selectedId === null ? 'Save' : 'Update'}
          </button>
          <button
            onClick={resetEditor}
            className="px-3 py-1 border rounded"
          >
            New Note
          </button>
        </div>
        <h3>Preview</h3>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a({ href, children }) {
              if (href?.startsWith('wiki:')) {
                const t = decodeURIComponent(href.slice(5))
                return (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      openNoteByTitle(t)
                    }}
                    className="text-blue-600 underline"
                  >
                    {children}
                  </a>
                )
              }
              return <a href={href}>{children}</a>
            }
          }}
        >
          {markdownWithWikiLinks(content)}
        </ReactMarkdown>
        {showGraph && <GraphView notes={notes} onOpen={openNoteByTitle} />}
      </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNotes } from './store'
import { initKey, hasPassphrase } from './crypto'
import GraphView from './GraphView'
import { markdownWithWikiLinks } from './utils'
import { builtInThemes, applyTheme } from './themes'
import { templates } from './templates'

export default function App() {
  const { notes, load, add, update, remove } = useNotes()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [folder, setFolder] = useState(0)
  const [tagsInput, setTagsInput] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [selectedFolder, setSelectedFolder] = useState(-1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [showGraph, setShowGraph] = useState(false)
  const [theme, setTheme] = useState<string>(() =>
    localStorage.getItem('inkrypt-theme') || 'Light'
  )
  const [customThemeJson, setCustomThemeJson] = useState(() =>
    localStorage.getItem('inkrypt-custom-theme') || '{"--bg":"#ffffff","--text":"#1f2937"}'
  )
  const [showThemeEditor, setShowThemeEditor] = useState(false)

  useEffect(() => {
    if (unlocked) {
      load()
    }
  }, [load, unlocked])

  useEffect(() => {
    const built = builtInThemes.find((t) => t.name === theme)
    if (built) applyTheme(built.vars)
    else {
      try {
        const vars = JSON.parse(customThemeJson)
        applyTheme(vars)
      } catch {
        // ignore parse errors
      }
    }
    localStorage.setItem('inkrypt-theme', theme)
    localStorage.setItem('inkrypt-custom-theme', customThemeJson)
  }, [theme, customThemeJson])

  const passExists = hasPassphrase()

  const handleUnlock = async () => {
    if (!passExists && passphrase !== confirmPassphrase) {
      setError('Passphrases do not match')
      return
    }
    try {
      const ok = await initKey(passphrase)
      if (ok) {
        setUnlocked(true)
        setPassphrase('')
        setConfirmPassphrase('')
        setError('')
      } else {
        setError('Incorrect passphrase')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to initialize encryption')
    }
  }

  const resetEditor = () => {
    setTitle('')
    setContent('')
    setFolder(0)
    setTagsInput('')
    setSelectedId(null)
  }

  const applyTemplate = (name: string) => {
    const t = templates.find((tp) => tp.name === name)
    if (t) {
      const date = new Date().toLocaleDateString()
      setContent(t.content.replace('{{date}}', date))
    }
  }

  const handleExport = () => {
    const data = JSON.stringify(notes, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inkrypt-notes.json'
    a.click()
    URL.revokeObjectURL(url)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleUnlock()
          }}
          className="glass p-8 flex flex-col gap-3 min-w-72"
        >
          <h2 className="text-lg font-semibold text-center">
            {passExists ? 'Enter Passphrase' : 'Set Passphrase'}
          </h2>
          <input
            type="password"
            autoFocus
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Passphrase"
            className="border rounded p-2 bg-white/70 dark:bg-gray-700/70"
          />
          {!passExists && (
            <input
              type="password"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              placeholder="Confirm"
              className="border rounded p-2 bg-white/70 dark:bg-gray-700/70"
            />
          )}
          <button
            type="submit"
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {passExists ? 'Unlock' : 'Set Passphrase'}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <header className="flex justify-between items-center backdrop-blur-md bg-white/20 dark:bg-gray-900/20 px-4 py-2 shadow-md border-b border-white/30 dark:border-gray-700/30">
        <h1 className="font-bold">Inkrypt</h1>
        <div className="flex gap-2 items-center">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="border rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white px-2 py-1"
          >
            {builtInThemes.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
            <option value="Custom">Custom</option>
          </select>
          {theme === 'Custom' && (
            <button
              onClick={() => setShowThemeEditor((v) => !v)}
              className="px-2 py-1 border rounded bg-white/30 hover:bg-white/40"
            >
              {showThemeEditor ? 'Close Editor' : 'Edit Theme'}
            </button>
          )}
          <select
            onChange={(e) => {
              applyTemplate(e.target.value)
              e.currentTarget.selectedIndex = 0
            }}
            className="px-2 py-1 border rounded bg-white/30 text-black dark:text-white"
          >
            <option>Insert Template</option>
            {templates.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <button onClick={() => setShowGraph((v) => !v)} className="px-2 py-1 border rounded bg-blue-600 hover:bg-blue-700">
            {showGraph ? 'Hide Graph' : 'Graph'}
          </button>
          <button onClick={resetEditor} className="px-2 py-1 border rounded bg-blue-600 hover:bg-blue-700">New Note</button>
          <button onClick={handleExport} className="px-2 py-1 border rounded bg-white/30 hover:bg-white/40">Export</button>
        </div>
      </header>
      {showThemeEditor && (
        <textarea
          value={customThemeJson}
          onChange={(e) => setCustomThemeJson(e.target.value)}
          rows={4}
          className="m-4 w-80 border p-2 font-mono rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white"
        />
      )}
      <div className="flex flex-1 gap-4 p-4 glass m-4">
      <div className="w-48 border-r border-white/30 pr-2">
        <h2>Notes</h2>
        <select
          className="mb-2 border p-1 w-full rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white"
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
          className="mb-2 border p-1 w-full rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter tag..."
          className="mb-2 border p-1 w-full rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
        <ul className="list-none p-0">
          {notes
            .filter(
              (n) =>
                (selectedFolder === -1 || n.folderId === selectedFolder) &&
                n.title.toLowerCase().includes(search.toLowerCase()) &&
                (tagFilter === '' || n.tags.includes(tagFilter))
            )
            .sort((a, b) => b.updatedAt - a.updatedAt)
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
                className="cursor-pointer py-1 hover:underline hover:bg-white/10 rounded px-1"
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
                  className="ml-2 px-1 text-sm border rounded bg-white/20 hover:bg-white/30"
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
          className="border p-2 rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white"
        />
        <input
          type="number"
          placeholder="Folder"
          value={folder}
          onChange={(e) => setFolder(Number(e.target.value))}
          className="border p-2 rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white"
        />
        <input
          type="text"
          placeholder="Tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="border p-2 rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="border p-2 font-mono rounded bg-white/70 dark:bg-gray-700/70 text-black dark:text-white"
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
            className="px-3 py-1 border rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            {selectedId === null ? 'Save' : 'Update'}
          </button>
          <button
            onClick={resetEditor}
            className="px-3 py-1 border rounded bg-white/30 hover:bg-white/40"
          >
            New Note
          </button>
        </div>
        <h3>Preview</h3>
        <div className="prose max-w-none text-black dark:text-white">
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
        </div>
        {showGraph && <GraphView notes={notes} onOpen={openNoteByTitle} />}
      </div>
      </div>
    </div>
  )
}

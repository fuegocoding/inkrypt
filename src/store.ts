import { create } from 'zustand'
import { db } from './db'
import type { Note } from './db'
import { encryptText, decryptText } from './crypto'

interface State {
  notes: Note[]
  load: () => Promise<void>
  add: (title: string, content: string) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useNotes = create<State>((set) => ({
  notes: [],
  async load() {
    const records = await db.notes.toArray()
    const decrypted = await Promise.all(
      records.map(async (n) => ({
        ...n,
        content: await decryptText(n.content)
      }))
    )
    set({ notes: decrypted })
  },
  async add(title, content) {
    const encrypted = await encryptText(content)
    const createdAt = Date.now()
    const id = await db.notes.add({ title, content: encrypted, createdAt })
    set((state) => ({ notes: [...state.notes, { id, title, content, createdAt }] }))
  },
  async remove(id) {
    await db.notes.delete(id)
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
  }
}))

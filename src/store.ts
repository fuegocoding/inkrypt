import { create } from 'zustand'
import { db } from './db'
import type { Note } from './db'
import { encryptText, decryptText } from './crypto'

interface State {
  notes: Note[]
  load: () => Promise<void>
  add: (
    title: string,
    content: string,
    folderId?: number,
    tags?: string[]
  ) => Promise<void>
  update: (
    id: number,
    title: string,
    content: string,
    folderId?: number,
    tags?: string[]
  ) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useNotes = create<State>((set) => ({
  notes: [],
  async load() {
    const records = await db.notes.toArray()
    const decrypted = await Promise.all(
      records.map(async (n) => ({
        ...n,
        folderId: n.folderId ?? 0,
        tags: n.tags ?? [],
        updatedAt: n.updatedAt ?? n.createdAt,
        content: await decryptText(n.content)
      }))
    )
    set({ notes: decrypted })
  },
  async add(title, content, folderId = 0, tags: string[] = []) {
    const encrypted = await encryptText(content)
    const createdAt = Date.now()
    const updatedAt = createdAt
    const id = await db.notes.add({
      title,
      content: encrypted,
      folderId,
      tags,
      createdAt,
      updatedAt
    })
    set((state) => ({
      notes: [
        ...state.notes,
        { id, title, content, folderId, tags, createdAt, updatedAt }
      ]
    }))
  },
  async update(id, title, content, folderId = 0, tags: string[] = []) {
    const encrypted = await encryptText(content)
    const updatedAt = Date.now()
    await db.notes.update(id, {
      title,
      content: encrypted,
      folderId,
      tags,
      updatedAt
    })
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, title, content, folderId, tags, updatedAt } : n
      )
    }))
  },
  async remove(id) {
    await db.notes.delete(id)
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
  }
}))

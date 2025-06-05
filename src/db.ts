import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface Note {
  id?: number
  title: string
  content: string // encrypted text
  folderId?: number
  tags: string[]
  createdAt: number
  updatedAt: number
}

class InkryptDB extends Dexie {
  notes!: Table<Note>
  constructor() {
    super('inkrypt')
    this.version(1).stores({
      notes: '++id, folderId, createdAt, updatedAt'
    })
  }
}

export const db = new InkryptDB()

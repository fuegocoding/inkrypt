import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface Note {
  id?: number
  title: string
  content: string // encrypted text
  createdAt: number
}

class InkryptDB extends Dexie {
  notes!: Table<Note>
  constructor() {
    super('inkrypt')
    this.version(1).stores({
      notes: '++id, createdAt'
    })
  }
}

export const db = new InkryptDB()

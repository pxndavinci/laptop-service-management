import { create } from 'zustand'

interface Draft {
  id: string
  data: unknown
  timestamp: number
  type: 'service-order' | 'customer' | 'product'
}

interface DraftStore {
  drafts: Map<string, Draft>
  saveDraft: (id: string, data: unknown, type: Draft['type']) => void
  getDraft: (id: string) => Draft | undefined
  removeDraft: (id: string) => void
  getDraftsForType: (type: Draft['type']) => Draft[]
  clearOldDrafts: (maxAgeMs?: number) => void
}

const DRAFT_STORAGE_KEY = 'service-management-drafts'
const DEFAULT_MAX_DRAFT_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

// Load drafts from localStorage
const loadDraftsFromStorage = (): Map<string, Draft> => {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!stored) return new Map()
    
    const parsed = JSON.parse(stored)
    return new Map(parsed)
  } catch (error) {
    console.error('[v0] Failed to load drafts from localStorage:', error)
    return new Map()
  }
}

// Save drafts to localStorage
const saveDraftsToStorage = (drafts: Map<string, Draft>) => {
  try {
    const data = Array.from(drafts.entries())
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('[v0] Failed to save drafts to localStorage:', error)
  }
}

export const useDraftStore = create<DraftStore>((set, get) => {
  // Load initial state from localStorage
  const initialDrafts = loadDraftsFromStorage()
  
  return {
    drafts: initialDrafts,
    
    saveDraft: (id, data, type) => {
      const draft: Draft = {
        id,
        data,
        timestamp: Date.now(),
        type,
      }
      
      set((state) => {
        const newDrafts = new Map(state.drafts)
        newDrafts.set(id, draft)
        saveDraftsToStorage(newDrafts)
        return { drafts: newDrafts }
      })
    },
    
    getDraft: (id) => {
      return get().drafts.get(id)
    },
    
    removeDraft: (id) => {
      set((state) => {
        const newDrafts = new Map(state.drafts)
        newDrafts.delete(id)
        saveDraftsToStorage(newDrafts)
        return { drafts: newDrafts }
      })
    },
    
    getDraftsForType: (type) => {
      return Array.from(get().drafts.values()).filter((draft) => draft.type === type)
    },
    
    clearOldDrafts: (maxAgeMs = DEFAULT_MAX_DRAFT_AGE) => {
      const now = Date.now()
      
      set((state) => {
        const newDrafts = new Map(state.drafts)
        
        for (const [id, draft] of newDrafts.entries()) {
          if (now - draft.timestamp > maxAgeMs) {
            newDrafts.delete(id)
          }
        }
        
        if (newDrafts.size !== state.drafts.size) {
          saveDraftsToStorage(newDrafts)
        }
        
        return { drafts: newDrafts }
      })
    },
  }
})

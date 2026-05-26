import { useEffect, useRef } from 'react'
import { useDraftStore } from '../../store/draftStore'
import { useUIStore } from '../../store/uiStore'

interface UseDraftAutoSaveOptions {
  draftId: string
  draftType: 'service-order' | 'customer' | 'product'
  debounceMs?: number
  enabled?: boolean
  onSave?: (savedAt: Date) => void
}

export const useDraftAutoSave = <T extends Record<string, unknown>>(
  data: T,
  options: UseDraftAutoSaveOptions
) => {
  const { draftId, draftType, debounceMs = 500, enabled = true, onSave } = options
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const saveDraft = useDraftStore((state) => state.saveDraft)
  const addNotification = useUIStore((state) => state.addNotification)

  // Auto-save on data change
  useEffect(() => {
    if (!enabled) {
      return
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      try {
        saveDraft(draftId, data, draftType)
        
        // Optional callback and notification
        const now = new Date()
        onSave?.(now)
        
        // Show minimal notification (optional - comment out if too noisy)
        // addNotification(`Draft saved at ${now.toLocaleTimeString()}`, 'info', 2000)
      } catch (error) {
        console.error('[v0] Failed to auto-save draft:', error)
        addNotification('Failed to save draft', 'error')
      }
    }, debounceMs)

    // Cleanup on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [data, draftId, draftType, debounceMs, enabled, saveDraft, addNotification, onSave])
}

export const useLoadDraft = <T>(draftId: string, draftType: 'service-order' | 'customer' | 'product') => {
  const getDraft = useDraftStore((state) => state.getDraft)
  const removeDraft = useDraftStore((state) => state.removeDraft)
  const addNotification = useUIStore((state) => state.addNotification)

  const draft = getDraft(draftId)
  
  // Check if draft exists and offer to recover
  useEffect(() => {
    if (draft && draft.type === draftType) {
      const recoveryAge = Date.now() - draft.timestamp
      const hoursAgo = Math.floor(recoveryAge / (1000 * 60 * 60))
      
      console.log('[v0] Draft found - offer recovery:', draft)
      // Note: Recovery UI should be handled in the page component
    }
  }, [draft, draftType])

  return {
    draftData: draft?.data as T | undefined,
    draftExists: !!draft && draft.type === draftType,
    removeDraft: () => removeDraft(draftId),
  }
}

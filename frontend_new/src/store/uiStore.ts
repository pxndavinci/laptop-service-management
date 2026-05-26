import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface UIStore {
  // Notifications
  notifications: Notification[]
  addNotification: (message: string, type: NotificationType, duration?: number) => void
  removeNotification: (id: string) => void
  
  // Modals
  openModals: Set<string>
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  
  // Drawers
  openDrawers: Set<string>
  openDrawer: (drawerId: string) => void
  closeDrawer: (drawerId: string) => void
  
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  notifications: [],
  addNotification: (message, type, duration = 5000) => {
    const id = `${Date.now()}-${Math.random()}`
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, type, message, duration },
      ],
    }))
    
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, duration)
    }
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
  
  openModals: new Set(),
  openModal: (modalId) => {
    set((state) => ({
      openModals: new Set([...state.openModals, modalId]),
    }))
  },
  closeModal: (modalId) => {
    set((state) => {
      const newSet = new Set(state.openModals)
      newSet.delete(modalId)
      return { openModals: newSet }
    })
  },
  
  openDrawers: new Set(),
  openDrawer: (drawerId) => {
    set((state) => ({
      openDrawers: new Set([...state.openDrawers, drawerId]),
    }))
  },
  closeDrawer: (drawerId) => {
    set((state) => {
      const newSet = new Set(state.openDrawers)
      newSet.delete(drawerId)
      return { openDrawers: newSet }
    })
  },
  
  isLoading: false,
  setIsLoading: (loading) => {
    set({ isLoading: loading })
  },
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (courseId: string) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const exists = state.items.find((i) => i.courseId === item.courseId)
          if (exists) return state
          return { items: [...state.items, item] }
        })
      },
      removeItem: (courseId) => {
        set((state) => ({
          items: state.items.filter((item) => item.courseId !== courseId),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
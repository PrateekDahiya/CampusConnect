import { create } from 'zustand'
import { api } from '../lib/mockApi'
import type { Complaint } from '../lib/mockApi'

type State = {
  complaints: Complaint[]
  loading: boolean
  loadComplaints: () => Promise<void>
  addComplaint: (c: { category: string; description: string; image?: string }) => Promise<void>
  updateStatus: (id: string, status: Complaint['status']) => Promise<void>
}

export const useStore = create<State>((set: any, get: any) => ({
  complaints: [] as Complaint[],
  loading: false,
  loadComplaints: async () => {
    set({ loading: true })
    const list = await api.listComplaints()
    set({ complaints: list, loading: false })
  },
  addComplaint: async (payload: { category: string; description: string; image?: string }) => {
    // optimistic update
    const temp: Complaint = {
      id: 'tmp-' + Math.random().toString(36).slice(2, 9),
      category: payload.category,
      description: payload.description,
      image: payload.image,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }
    set((s: State) => ({ complaints: [temp, ...s.complaints] }))
    try {
      const created = await api.createComplaint(payload as any)
      // replace temp with created
      set((s: State) => ({ complaints: [created, ...s.complaints.filter((c) => c.id !== temp.id)] }))
    } catch (e) {
      // rollback
      set((s: State) => ({ complaints: s.complaints.filter((c) => c.id !== temp.id) }))
      throw e
    }
  },
  updateStatus: async (id: string, status: Complaint['status']) => {
    // optimistic
    const prev = get().complaints
    set((s: State) => ({ complaints: s.complaints.map((c) => (c.id === id ? { ...c, status } : c)) }))
    try {
      await api.updateComplaintStatus(id, status)
    } catch (e) {
      set({ complaints: prev })
      throw e
    }
  },
}))

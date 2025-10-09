import { create } from 'zustand'
import { api } from '../lib/mockApi'
import type { Complaint, Cycle, Booking } from '../lib/mockApi'

type State = {
  complaints: Complaint[]
  loading: boolean
  loadComplaints: () => Promise<void>
  addComplaint: (c: { title: string; hostel: string; description: string; image?: string; createdBy?: string }) => Promise<void>
  updateStatus: (id: string, status: Complaint['status']) => Promise<void>
  // cycles
  cycles: Cycle[]
  loadCycles: (filter?: { status?: Cycle['status']; location?: string }) => Promise<void>
  bookCycle: (userId: string, cycleId: string, expectedReturnTime: string) => Promise<void>
  bookings: Booking[]
  loadBookings: (userId?: string) => Promise<void>
  returnBooking: (bookingId: string) => Promise<void>
}

export const useStore = create<State>((set: any, get: any) => ({
  complaints: [] as Complaint[],
  loading: false,
  loadComplaints: async () => {
    set({ loading: true })
    const list = await api.listComplaints()
    set({ complaints: list, loading: false })
  },
  addComplaint: async (payload: { title: string; hostel: string; description: string; image?: string; createdBy?: string }) => {
    // optimistic update
    const temp: Complaint = {
      id: 'tmp-' + Math.random().toString(36).slice(2, 9),
      title: payload.title,
      hostel: payload.hostel,
      description: payload.description,
      image: payload.image,
      createdBy: payload.createdBy,
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
  // cycles & bookings
  cycles: [] as Cycle[],
  bookings: [] as Booking[],
  loadCycles: async (filter) => {
    const list = await api.listCycles(filter as any)
    set({ cycles: list })
  },
  bookCycle: async (userId, cycleId, expectedReturnTime) => {
    await api.createBooking(userId, cycleId, expectedReturnTime)
    // refresh cycles and bookings
    await get().loadCycles({ status: 'available' })
    await get().loadBookings(userId)
  },
  loadBookings: async (userId) => {
    const list = await api.listBookings(userId)
    set({ bookings: list })
  },
  returnBooking: async (bookingId) => {
    await api.returnBooking(bookingId)
    // refresh cycles/bookings
    await get().loadCycles({ status: 'available' })
    await get().loadBookings()
  },
}))

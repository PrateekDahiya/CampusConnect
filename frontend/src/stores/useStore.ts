import { create } from 'zustand'
import { api } from '../lib/mockApi'
import type { Complaint, Cycle, Booking, LostItem } from '../lib/mockApi'

type State = {
  complaints: Complaint[]
  loading: boolean
  loadComplaints: () => Promise<void>
  addComplaint: (c: { title: string; hostel: string; description: string; complaintType?: string; roomNumber?: string; attachments?: string[]; createdBy?: string }) => Promise<void>
  updateStatus: (id: string, status: Complaint['status']) => Promise<void>
  addRemark: (id: string, text: string, by?: string) => Promise<void>
  assignStaff: (id: string, staffId: string) => Promise<void>
  setSatisfaction: (id: string, satisfied: 'yes' | 'no') => Promise<void>
  // cycles
  cycles: Cycle[]
  loadCycles: (filter?: { status?: Cycle['status']; location?: string }) => Promise<void>
  createListing: (p: Partial<Cycle> & { owner?: string }) => Promise<Cycle>
  requestCycle: (p: { cycleId: string; requesterId: string; message?: string; startTime?: string; expectedReturnTime?: string }) => Promise<any>
  respondCycleRequest: (requestId: string, accept: boolean) => Promise<any>
  markCycleReturned: (cycleId: string) => Promise<any>
  bookCycle: (userId: string, cycleId: string, expectedReturnTime: string) => Promise<void>
  bookings: Booking[]
  loadBookings: (userId?: string) => Promise<void>
  returnBooking: (bookingId: string) => Promise<void>
  // lost & found
  lostFound: LostItem[]
  loadLostFound: () => Promise<void>
  addLostItem: (p: { title: string; category?: string; description?: string; location?: string; image?: string; reportedBy?: string; found?: boolean }) => Promise<void>
  markFound: (id: string) => Promise<void>
  queryLostFound: (opts?: { category?: string; type?: 'lost' | 'found'; q?: string; sort?: 'newest' | 'oldest' }) => Promise<void>
  findMatches: (id: string) => Promise<LostItem[]>
  claimItem: (itemId: string, userId: string, proof?: string) => Promise<any>
  approveClaim: (itemId: string, claimId: string, approve: boolean) => Promise<any>
}

export const useStore = create<State>((set: any, get: any) => ({
  complaints: [] as Complaint[],
  loading: false,
  loadComplaints: async () => {
    set({ loading: true })
    const list = await api.listComplaints()
    set({ complaints: list, loading: false })
  },
  addComplaint: async (payload: { title: string; hostel: string; description: string; complaintType?: string; roomNumber?: string; attachments?: string[]; createdBy?: string }) => {
    // optimistic update
    const temp: Complaint = {
      id: 'tmp-' + Math.random().toString(36).slice(2, 9),
      title: payload.title,
      complaintType: payload.complaintType,
      roomNumber: payload.roomNumber,
      hostel: payload.hostel,
      description: payload.description,
      attachments: payload.attachments || [],
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
  addRemark: async (id: string, text: string, by?: string) => {
    const remark = await api.addComplaintRemark(id, text, by)
    // refresh list
    await get().loadComplaints()
    return remark
  },
  assignStaff: async (id: string, staffId: string) => {
    await api.assignComplaintStaff(id, staffId)
    await get().loadComplaints()
  },
  setSatisfaction: async (id: string, satisfied: 'yes' | 'no') => {
    await api.setComplaintSatisfaction(id, satisfied)
    await get().loadComplaints()
  },
  // cycles & bookings
  cycles: [] as Cycle[],
  bookings: [] as Booking[],
  createListing: async (p) => {
    const created = await api.createCycleListing(p as any)
    await get().loadCycles()
    return created
  },
  requestCycle: async (p) => {
    await api.requestCycle(p)
    await get().loadCycles()
  },
  respondCycleRequest: async (requestId, accept) => {
    await api.respondCycleRequest(requestId, accept)
    await get().loadCycles()
  },
  markCycleReturned: async (cycleId) => {
    await api.markCycleReturned(cycleId)
    await get().loadCycles()
  },
  // lost & found
  lostFound: [] as LostItem[],
  loadLostFound: async () => {
    const list = await api.listLostFound()
    set({ lostFound: list })
  },
  addLostItem: async (p) => {
    const temp: LostItem = {
      id: 'tmp-' + Math.random().toString(36).slice(2, 9),
      title: p.title,
      category: p.category,
      description: p.description,
      location: p.location,
      image: p.image,
      reportedBy: p.reportedBy,
      found: p.found ?? false,
      createdAt: new Date().toISOString(),
    }
    set((s: State) => ({ lostFound: [temp, ...s.lostFound] }))
    try {
      const created = await api.createLostItem(p as any)
      set((s: State) => ({ lostFound: [created, ...s.lostFound.filter((i) => i.id !== temp.id)] }))
    } catch (e) {
      set((s: State) => ({ lostFound: s.lostFound.filter((i) => i.id !== temp.id) }))
      throw e
    }
  },
  markFound: async (id) => {
    const prev = get().lostFound
    set((s: State) => ({ lostFound: s.lostFound.map((i) => (i.id === id ? { ...i, found: true } : i)) }))
    try {
      await api.markItemFound(id)
    } catch (e) {
      set({ lostFound: prev })
      throw e
    }
  },
  queryLostFound: async (opts) => {
    const list = await api.queryLostFound(opts as any)
    set({ lostFound: list })
  },
  findMatches: async (id) => {
    const matches = await api.findMatchesForItem(id)
    return matches
  },
  claimItem: async (itemId, userId, proof) => {
    const claim = await api.claimItem(itemId, userId, proof)
    // refresh list for simplicity
    await get().loadLostFound()
    return claim
  },
  approveClaim: async (itemId, claimId, approve) => {
    const res = await api.approveClaim(itemId, claimId, approve)
    await get().loadLostFound()
    return res
  },
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

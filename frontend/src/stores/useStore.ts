import { create } from 'zustand'
import { api } from '../lib/mockApi'
import { api as realApi } from '../lib/api'
import type { Complaint, Cycle, Booking, LostItem, Book } from '../lib/mockApi'

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
  addLostItem: (p: { type: 'lost' | 'found'; title: string; category?: string; description?: string; location?: string; images?: string[] }) => Promise<void>
  markFound: (id: string) => Promise<void>
  queryLostFound: (opts?: { category?: string; type?: 'lost' | 'found'; q?: string; sort?: 'newest' | 'oldest' }) => Promise<void>
  findMatches: (id: string) => Promise<LostItem[]>
  claimItem: (itemId: string, userId: string, proof?: string) => Promise<any>
  approveClaim: (itemId: string, claimId: string, approve: boolean) => Promise<any>
  // books
  createBookListing: (p: Omit<Book, 'id' | 'status' | 'createdAt'>) => Promise<Book>
  queryBooks: (opts?: { q?: string; category?: string; type?: string; sort?: 'newest' | 'price-low' | 'price-high' }) => Promise<void>
  requestBook: (p: { bookId: string; requesterId: string; period?: string; message?: string }) => Promise<any>
  respondBookRequest: (requestId: string, accept: boolean) => Promise<any>
  markBookReturned: (bookId: string) => Promise<Book | null>
  books: Book[]
}

export const useStore = create<State>((set: any, get: any) => ({
  complaints: [] as Complaint[],
  loading: false,
  loadComplaints: async () => {
    set({ loading: true })
    try {
      const backend = await realApi.complaints.getAllComplaints()
      const converted = backend.map((b: any) => ({
        id: b._id,
        title: b.title,
        description: b.description,
        hostel: b.hostel,
        status: b.status,
        createdBy: b.createdBy,
        assignedStaff: b.assignedStaff || '',
        remarks: b.remarks || [],
        complaintType: b.complaintType || 'General',
        roomNumber: b.roomNumber || '',
        attachments: b.attachments || [],
        createdAt: b.createdAt,
      }))
      set({ complaints: converted, loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
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
    const created = await realApi.cycles.createCycle(p as any)
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
  const list = await realApi.lostFound.getItems()
    const norm = (item: any) => ({
      ...item,
      id: item.id || item._id,
      image: item.image || (item.images && item.images[0]),
    })
    set({ lostFound: list.map(norm) })
  },
  addLostItem: async (p) => {
    const temp: LostItem = {
      id: 'tmp-' + Math.random().toString(36).slice(2, 9),
      title: p.title,
      category: p.category,
      description: p.description,
      location: p.location,
      image: p.images ? p.images[0] : undefined,
      createdAt: new Date().toISOString(),
    }
    set((s: State) => ({ lostFound: [temp, ...s.lostFound] }))
    try {
  const created = await realApi.lostFound.reportItem(p as any)
      const normCreated = {
        ...created,
        id: created.id || created._id,
        image: created.image || (created.images && created.images[0]),
      }
      set((s: State) => ({ lostFound: [normCreated, ...s.lostFound.filter((i) => i.id !== temp.id)] }))
    } catch (e) {
      set((s: State) => ({ lostFound: s.lostFound.filter((i) => i.id !== temp.id) }))
      throw e
    }
  },
  markFound: async (id) => {
    const prev = get().lostFound
    set((s: State) => ({ lostFound: s.lostFound.map((i) => (i.id === id ? { ...i, found: true } : i)) }))
    try {
  if (!id) throw new Error('Invalid id');
  await realApi.lostFound.markFound(id)
      // refresh to ensure we have server-normalized ids/_ids
      await get().loadLostFound()
    } catch (e) {
      set({ lostFound: prev })
      throw e
    }
  },
  queryLostFound: async (opts) => {
  const list = await realApi.lostFound.getItems(opts as any)
    set({ lostFound: list })
  },
  // books
  books: [] as Book[],
  findMatches: async (id) => {
  if (!id) throw new Error('Invalid id')
  const matches = await realApi.lostFound.findMatches(id)
    const norm = (item: any) => ({
      ...item,
      id: item.id || item._id,
      image: item.image || (item.images && item.images[0]),
    })
    return matches.map(norm)
  },
  claimItem: async (itemId, _userId, proof) => {
  if (!itemId) throw new Error('Invalid id')
  const claim = await realApi.lostFound.claimItem(itemId, proof)
    // refresh list for simplicity
    await get().loadLostFound()
    return claim
  },
  approveClaim: async (itemId, claimId, approve) => {
  const res = await realApi.lostFound.approveClaim(itemId, claimId, approve)
    await get().loadLostFound()
    return res
  },
  // books
  createBookListing: async (p) => {
    const created = await realApi.books.addBook(p as any)
    // refresh the list to show new book
    await get().queryBooks()
    return created
  },
  queryBooks: async (opts) => {
    const list = await realApi.books.getBooks(opts as any)
    const norm = list.map((b: any) => ({ ...b, id: b._id || b.id }))
    set({ books: norm })
  },
  requestBook: async (p) => {
    const req = await api.requestBook(p)
    return req
  },
  respondBookRequest: async (id, accept) => {
    const res = await api.respondBookRequest(id, accept)
    return res
  },
  markBookReturned: async (id) => {
    const res = await api.markBookReturned(id)
    return res
  },
  loadCycles: async (filter) => {
    const list = await realApi.cycles.getAvailableCycles(filter?.location)
    const norm = list.map((c: any) => ({ ...c, id: c._id || c.id }))
    set({ cycles: norm })
  },
  bookCycle: async (userId, cycleId, expectedReturnTime) => {
    await api.createBooking(userId, cycleId, expectedReturnTime)
    // refresh cycles and bookings
    await get().loadCycles({ status: 'available' })
    await get().loadBookings(userId)
  },
  loadBookings: async () => {
    const list = await realApi.bookings.getMyBookings()
    const norm = list.map((b: any) => ({ ...b, id: b._id || b.id }))
    set({ bookings: norm })
  },
  returnBooking: async (bookingId) => {
    await api.returnBooking(bookingId)
    // refresh cycles/bookings
    await get().loadCycles({ status: 'available' })
    await get().loadBookings()
  },
}))

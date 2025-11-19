export type Complaint = {
  id: string
  title: string
  complaintType?: string
  roomNumber?: string
  description: string
  hostel: string
  createdBy?: string
  attachments?: string[]
  assignedStaff?: string
  remarks?: { id: string; text: string; by?: string; createdAt: string }[]
  satisfied?: 'yes' | 'no' | null
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
  createdAt: string
}

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// initial mock data
const initialComplaints: Complaint[] = [
  {
    id: 'c1',
    title: 'Leaking Tap',
    complaintType: 'Plumbing',
    roomNumber: '101',
    description: 'Leaking tap in block A',
    hostel: 'Hostel A',
    createdBy: 'user1',
    attachments: [],
    remarks: [],
    status: 'Pending',
    satisfied: null,
    createdAt: new Date().toISOString(),
  },
]

export type CycleRequest = {
  id: string
  cycleId: string
  requesterId: string
  message?: string
  startTime?: string
  expectedReturnTime?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export type MockDb = {
  complaints: Complaint[]
  cycles: Cycle[]
  bookings: Booking[]
  cycleRequests?: CycleRequest[]
  lostFound?: LostItem[]
  books?: Book[]
}

export const mockDb: MockDb = {
  complaints: [...initialComplaints],
  cycles: [],
  bookings: [],
  cycleRequests: [],
}

export type Cycle = {
  id: string
  model?: string
  owner?: string
  description?: string
  images?: string[]
  isGear?: boolean
  fee?: number
  deposit?: number
  availableFrom?: string
  availableTo?: string
  location: string
  station?: string
  isApproved?: boolean
  status: 'available' | 'booked' | 'maintenance' | 'pending' | 'requested' | 'lent'
}

export type Booking = {
  id: string
  cycleId: string
  userId: string
  startTime: string
  expectedReturnTime: string
  returnTime?: string
  status: 'booked' | 'active' | 'returned'
}

const initialCycles: Cycle[] = [
  { id: 'cy1', model: 'CityBike 1', owner: 'student-123', description: 'City bike, decent condition', images: [], isGear: false, fee: 0, deposit: 0, location: 'Near Hostel A', station: 'Stand 1', isApproved: true, status: 'available' },
  { id: 'cy2', model: 'CityBike 2', owner: 'student-456', description: 'Smooth ride, light frame', images: [], isGear: true, fee: 10, deposit: 100, location: 'Cycle Stand 2', station: 'Stand 2', isApproved: true, status: 'available' },
  { id: 'cy3', model: 'Roadster', owner: 'student-789', description: 'Needs maintenance', images: [], isGear: false, fee: 0, deposit: 0, location: 'Near Hostel B', station: 'Stand 3', isApproved: false, status: 'maintenance' },
]

mockDb['cycles'] = [...initialCycles]
mockDb['bookings'] = []
mockDb['cycleRequests'] = []
// Lost & Found initial data
export type LostItem = {
  id: string
  title: string
  category?: string
  description?: string
  location?: string
  image?: string
  found?: boolean
  reportedBy?: string
  createdAt: string
  claim?: {
    id: string
    userId: string
    proof?: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    approvedBy?: string
  }
}

export type Book = {
  id: string
  title: string
  author?: string
  edition?: string
  condition?: string
  category?: string
  isbn?: string
  price?: number
  rent?: number
  type?: 'sell' | 'rent' | 'free'
  description?: string
  photo?: string
  location?: string
  owner?: string
  status?: 'available' | 'lent' | 'sold'
  isApproved?: boolean
  createdAt: string
}

const initialLost: LostItem[] = [
  {
    id: 'l1',
    title: 'Black Wallet',
    category: 'Personal',
    description: 'Black leather wallet near library',
    location: 'Library',
    reportedBy: 'user2',
    found: false,
    createdAt: new Date().toISOString(),
  },
]

mockDb['lostFound'] = [...initialLost]

const initialBooks: Book[] = [
  {
    id: 'b1',
    title: 'Introduction to Computer Science',
    author: 'David S. Malik',
    edition: '8th Edition',
    condition: 'used',
    category: 'Computer Science',
    isbn: '978-1337102087',
    price: 150,
    type: 'sell',
    description: 'Well-maintained textbook for CS fundamentals course. Minimal highlighting.',
    photo: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=500&fit=crop',
    location: 'Hostel A',
    owner: 'user1',
    status: 'available',
    isApproved: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'b2',
    title: 'Calculus: Early Transcendentals',
    author: 'James Stewart',
    edition: '9th Edition',
    condition: 'new',
    category: 'Mathematics',
    isbn: '978-1337613927',
    rent: 25,
    type: 'rent',
    description: 'Brand new calculus textbook. Available for rent per week.',
    photo: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=400&h=500&fit=crop',
    location: 'Main Campus',
    owner: 'user2',
    status: 'available',
    isApproved: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: 'b3',
    title: 'Data Structures and Algorithms',
    author: 'Robert Lafore',
    edition: '2nd Edition',
    condition: 'fair',
    category: 'Computer Science',
    isbn: '978-0672324703',
    price: 80,
    type: 'sell',
    description: 'Good for learning DSA concepts. Some pages have notes.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    location: 'Library Block',
    owner: 'user3',
    status: 'available',
    isApproved: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    id: 'b4',
    title: 'Organic Chemistry',
    author: 'Paula Yurkanis Bruice',
    edition: '8th Edition',
    condition: 'used',
    category: 'Chemistry',
    isbn: '978-0134042282',
    price: 200,
    rent: 30,
    type: 'sell',
    description: 'Comprehensive organic chemistry textbook. Great for pre-med students.',
    photo: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=500&fit=crop',
    location: 'Science Block',
    owner: 'user4',
    status: 'available',
    isApproved: true,
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
  },
  {
    id: 'b5',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    edition: 'Classic Edition',
    condition: 'new',
    category: 'Literature',
    isbn: '978-0743273565',
    type: 'free',
    description: 'Classic American literature. Free for anyone who wants to read it.',
    photo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop',
    location: 'Hostel B',
    owner: 'user5',
    status: 'available',
    isApproved: true,
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
]

mockDb['books'] = [...initialBooks]

export const api = {
  async listComplaints() {
    await delay(250)
    return JSON.parse(JSON.stringify(mockDb.complaints)) as Complaint[]
  },
  async createComplaint(payload: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'createdBy'> & { createdBy?: string }) {
    await delay(200)
    const newItem: Complaint = {
      id: Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      status: 'Pending',
      createdBy: payload.createdBy || 'user1',
      ...payload,
      attachments: (payload as any).attachments || [],
      remarks: (payload as any).remarks || [],
      satisfied: (payload as any).satisfied ?? null,
    }
    mockDb.complaints.unshift(newItem)
    return JSON.parse(JSON.stringify(newItem)) as Complaint
  },
  async addComplaintRemark(id: string, text: string, by?: string) {
    await delay(150)
    const found = mockDb.complaints.find((c) => c.id === id)
    if (!found) return null
    const remark = { id: Math.random().toString(36).slice(2, 9), text, by: by || 'user', createdAt: new Date().toISOString() }
    found.remarks = found.remarks || []
    found.remarks.push(remark)
    return JSON.parse(JSON.stringify(remark))
  },
  async assignComplaintStaff(id: string, staffId: string) {
    await delay(150)
    const found = mockDb.complaints.find((c) => c.id === id)
    if (!found) return null
    found.assignedStaff = staffId
    return JSON.parse(JSON.stringify(found))
  },
  async setComplaintSatisfaction(id: string, satisfied: 'yes' | 'no') {
    await delay(150)
    const found = mockDb.complaints.find((c) => c.id === id)
    if (!found) return null
    found.satisfied = satisfied
    return JSON.parse(JSON.stringify(found))
  },
  async updateComplaintStatus(id: string, status: Complaint['status']) {
    await delay(150)
    const found = mockDb.complaints.find((c) => c.id === id)
    if (found) found.status = status
    return found ? JSON.parse(JSON.stringify(found)) : null
  },
  // Cycles & Bookings API (frontend-only mock)
  async listCycles(filter?: { status?: Cycle['status']; location?: string }) {
    await delay(200)
    let list = (mockDb['cycles'] || []) as Cycle[]
    if (filter?.status) list = list.filter((c) => c.status === filter.status)
  if (filter?.location) list = list.filter((c) => c.location.includes(filter.location as string))
    return JSON.parse(JSON.stringify(list)) as Cycle[]
  },
  async createCycleListing(payload: Omit<Cycle, 'id' | 'status' | 'isApproved'> & { owner?: string; isApproved?: boolean }) {
    await delay(200)
    const item: Cycle = {
      id: Math.random().toString(36).slice(2, 9),
      status: (payload as any).status || 'pending',
      isApproved: payload.isApproved ?? false,
      ...payload,
    }
    mockDb['cycles'] = [item, ...(mockDb['cycles'] || [])]
    return JSON.parse(JSON.stringify(item)) as Cycle
  },
  async requestCycle(payload: { cycleId: string; requesterId: string; message?: string; startTime?: string; expectedReturnTime?: string }) {
    await delay(200)
    const req: CycleRequest = {
      id: Math.random().toString(36).slice(2, 9),
      cycleId: payload.cycleId,
      requesterId: payload.requesterId,
      message: payload.message,
      startTime: payload.startTime,
      expectedReturnTime: payload.expectedReturnTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    mockDb['cycleRequests'] = [req, ...(mockDb['cycleRequests'] || [])]
    // mark cycle as requested
    const cycle = (mockDb['cycles'] || []).find((c) => c.id === payload.cycleId)
    if (cycle) cycle.status = 'requested'
    return JSON.parse(JSON.stringify(req))
  },
  async respondCycleRequest(requestId: string, accept: boolean) {
    await delay(200)
    const reqs = mockDb['cycleRequests'] || []
    const r = reqs.find((x) => x.id === requestId)
    if (!r) return null
    r.status = accept ? 'accepted' : 'rejected'
    if (accept) {
      // create booking record
      const booking: Booking = {
        id: Math.random().toString(36).slice(2, 9),
        cycleId: r.cycleId,
        userId: r.requesterId,
        startTime: r.startTime || new Date().toISOString(),
        expectedReturnTime: r.expectedReturnTime || new Date(Date.now() + 3600 * 1000).toISOString(),
        status: 'booked',
      }
      mockDb['bookings'] = [booking, ...(mockDb['bookings'] || [])]
      const cycle = (mockDb['cycles'] || []).find((c) => c.id === r.cycleId)
      if (cycle) cycle.status = 'lent'
      return JSON.parse(JSON.stringify(booking))
    }
    return JSON.parse(JSON.stringify(r))
  },
  async markCycleReturned(cycleId: string) {
    await delay(150)
    const cycles = mockDb['cycles'] || []
    const c = cycles.find((x) => x.id === cycleId)
    if (!c) return null
    c.status = 'available'
    return JSON.parse(JSON.stringify(c))
  },
  async createBooking(userId: string, cycleId: string, expectedReturnTime: string) {
    await delay(250)
    // Check if user has active booking
    const bookings = (mockDb['bookings'] || []) as Booking[]
    const hasActive = bookings.some((b) => b.userId === userId && (b.status === 'booked' || b.status === 'active'))
    if (hasActive) {
      const err: any = new Error('User has an active booking')
      err.code = 'ACTIVE_BOOKING'
      throw err
    }
    // Check cycle availability
    const cycles = (mockDb['cycles'] || []) as Cycle[]
    const cycle = cycles.find((c) => c.id === cycleId)
    if (!cycle || cycle.status !== 'available') {
      const err: any = new Error('Cycle not available')
      err.code = 'CYCLE_UNAVAILABLE'
      throw err
    }
    // Reserve cycle
    cycle.status = 'booked'
    const booking: Booking = {
      id: Math.random().toString(36).slice(2, 9),
      cycleId,
      userId,
      startTime: new Date().toISOString(),
      expectedReturnTime,
      status: 'booked',
    }
    bookings.unshift(booking)
    mockDb['bookings'] = bookings
    mockDb['cycles'] = cycles
    return JSON.parse(JSON.stringify(booking)) as Booking
  },
  async listBookings(userId?: string) {
    await delay(150)
    let list = (mockDb['bookings'] || []) as Booking[]
    if (userId) list = list.filter((b) => b.userId === userId)
    return JSON.parse(JSON.stringify(list)) as Booking[]
  },
  async returnBooking(bookingId: string) {
    await delay(200)
    const bookings = (mockDb['bookings'] || []) as Booking[]
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) {
      const err: any = new Error('Booking not found')
      err.code = 'NOT_FOUND'
      throw err
    }
    if (booking.status === 'returned') return booking
    booking.returnTime = new Date().toISOString()
    booking.status = 'returned'
    // mark cycle available
    const cycles = (mockDb['cycles'] || []) as Cycle[]
    const cycle = cycles.find((c) => c.id === booking.cycleId)
    if (cycle) cycle.status = 'available'
    mockDb['bookings'] = bookings
    mockDb['cycles'] = cycles
    return JSON.parse(JSON.stringify(booking)) as Booking
  },
  // Lost & Found
  async listLostFound() {
    await delay(150)
    return JSON.parse(JSON.stringify(mockDb['lostFound'] || [])) as LostItem[]
  },
  // list with optional filters: category, type(found/lost), search keyword, sort
  async queryLostFound(opts?: { category?: string; type?: 'lost' | 'found'; q?: string; sort?: 'newest' | 'oldest' }) {
    await delay(150)
    let list = (mockDb['lostFound'] || []) as LostItem[]
    if (opts?.category) list = list.filter((i) => i.category === opts.category)
    if (opts?.type) list = list.filter((i) => (opts.type === 'found' ? i.found : !i.found))
    if (opts?.q) {
      const q = opts.q.toLowerCase()
      list = list.filter((i) => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q))
    }
    if (opts?.sort === 'newest') list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    if (opts?.sort === 'oldest') list = list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    return JSON.parse(JSON.stringify(list)) as LostItem[]
  },
  // naive matching: returns potential matches between lost and found by simple title/description similarity
  async findMatchesForItem(id: string) {
    await delay(250)
    const list = mockDb['lostFound'] || []
    const item = list.find((i) => i.id === id)
    if (!item) return []
    const isFound = !!item.found
    // match against opposite type
    const candidates = list.filter((i) => (isFound ? !i.found : i.found) && i.id !== id)
    const q = (item.title || '') + ' ' + (item.description || '')
    const qLower = q.toLowerCase()
    // score by keyword overlap
    const scored = candidates.map((c) => {
      const text = ((c.title || '') + ' ' + (c.description || '')).toLowerCase()
      const score = qLower.split(/\s+/).reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0)
      return { c, score }
    })
    const top = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.c)
    return JSON.parse(JSON.stringify(top)) as LostItem[]
  },
  // claim flow: user claims item; mock stores a claim object on the item
  async claimItem(itemId: string, userId: string, proof?: string) {
    await delay(200)
    const list = mockDb['lostFound'] || []
    const item = list.find((i) => i.id === itemId)
    if (!item) {
      const err: any = new Error('Item not found')
      err.code = 'NOT_FOUND'
      throw err
    }
    ;(item as any).claim = { id: Math.random().toString(36).slice(2, 9), userId, proof, status: 'pending', createdAt: new Date().toISOString() }
    mockDb['lostFound'] = list
    return JSON.parse(JSON.stringify((item as any).claim))
  },
  async approveClaim(itemId: string, claimId: string, approve: boolean) {
    await delay(150)
    const list = mockDb['lostFound'] || []
    const item = list.find((i) => i.id === itemId)
    if (!item) return null
    const claim = (item as any).claim
    if (!claim || claim.id !== claimId) return null
    claim.status = approve ? 'approved' : 'rejected'
    if (approve) item.found = true
    mockDb['lostFound'] = list
    return JSON.parse(JSON.stringify(claim))
  },
  async createLostItem(payload: Omit<LostItem, 'id' | 'createdAt' | 'reportedBy'> & { reportedBy?: string }) {
    await delay(200)
    const newItem: LostItem = {
      id: Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      found: (payload as any).found ?? false,
      reportedBy: payload.reportedBy || 'user1',
      ...payload,
    }
    mockDb['lostFound'] = [newItem, ...(mockDb['lostFound'] || [])]
    return JSON.parse(JSON.stringify(newItem)) as LostItem
  },
  async markItemFound(id: string) {
    await delay(150)
    const list = mockDb['lostFound'] || []
    const found = list.find((i) => i.id === id)
    if (found) found.found = true
    mockDb['lostFound'] = list
    return found ? JSON.parse(JSON.stringify(found)) as LostItem : null
  },
  // Books / Book Bank
  async createBookListing(payload: {
    title: string
    author?: string
    edition?: string
    condition?: string
    category?: string
    isbn?: string
    price?: number
    rent?: number
    type?: 'sell' | 'rent' | 'free'
    description?: string
    photo?: string
    location?: string
    owner?: string
    isApproved?: boolean
  }) {
    await delay(200)
    const book: Book = {
      id: Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      status: 'available',
      isApproved: payload.isApproved ?? false,
      ...payload,
    }
    mockDb.books = [book, ...(mockDb.books || [])]
    return JSON.parse(JSON.stringify(book)) as Book
  },
  async queryBooks(opts?: { q?: string; category?: string; type?: string; sort?: 'newest' | 'price-low' | 'price-high' }) {
    await delay(150)
    let list = (mockDb.books || []) as Book[]
    if (opts?.category) list = list.filter((b) => b.category === opts.category)
    if (opts?.type) list = list.filter((b) => b.type === opts.type)
    if (opts?.q) {
      const q = opts.q.toLowerCase()
      list = list.filter((b) => (b.title || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q) || (b.isbn || '').toLowerCase().includes(q))
    }
    if (opts?.sort === 'newest') list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    if (opts?.sort === 'price-low') list = list.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (opts?.sort === 'price-high') list = list.sort((a, b) => (b.price || 0) - (a.price || 0))
    return JSON.parse(JSON.stringify(list)) as Book[]
  },
  async requestBook(payload: { bookId: string; requesterId: string; period?: string; message?: string }) {
    await delay(200)
    const req = { id: Math.random().toString(36).slice(2, 9), bookId: payload.bookId, requesterId: payload.requesterId, period: payload.period, message: payload.message, status: 'pending', createdAt: new Date().toISOString() }
    ;(mockDb as any).bookRequests = [req, ...((mockDb as any).bookRequests || [])]
    return JSON.parse(JSON.stringify(req))
  },
  async respondBookRequest(requestId: string, accept: boolean) {
    await delay(200)
    const reqs = (mockDb as any).bookRequests || []
    const r = reqs.find((x: any) => x.id === requestId)
    if (!r) return null
    r.status = accept ? 'accepted' : 'rejected'
    if (accept) {
      const book = (mockDb.books || []).find((b: Book) => b.id === r.bookId)
      if (book) book.status = 'lent'
      return JSON.parse(JSON.stringify(r))
    }
    return JSON.parse(JSON.stringify(r))
  },
  async markBookReturned(bookId: string) {
    await delay(150)
    const books = mockDb.books || []
    const b = books.find((x: Book) => x.id === bookId)
    if (!b) return null
    b.status = 'available'
    return JSON.parse(JSON.stringify(b)) as Book
  },
}

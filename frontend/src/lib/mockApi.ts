export type Complaint = {
  id: string
  title: string
  description: string
  hostel: string
  createdBy?: string
  image?: string
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
  createdAt: string
}

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// initial mock data
const initialComplaints: Complaint[] = [
  {
    id: 'c1',
    title: 'Leaking Tap',
    description: 'Leaking tap in block A',
    hostel: 'Hostel A',
    createdBy: 'user1',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
]

export type MockDb = {
  complaints: Complaint[]
  cycles: Cycle[]
  bookings: Booking[]
}

export const mockDb: MockDb = {
  complaints: [...initialComplaints],
  cycles: [],
  bookings: [],
}

export type Cycle = {
  id: string
  model?: string
  location: string
  station?: string
  status: 'available' | 'booked' | 'maintenance'
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
  { id: 'cy1', model: 'CityBike 1', location: 'Near Hostel A', station: 'Stand 1', status: 'available' },
  { id: 'cy2', model: 'CityBike 2', location: 'Cycle Stand 2', station: 'Stand 2', status: 'available' },
  { id: 'cy3', model: 'Roadster', location: 'Near Hostel B', station: 'Stand 3', status: 'maintenance' },
]

mockDb['cycles'] = [...initialCycles]
mockDb['bookings'] = []

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
    }
    mockDb.complaints.unshift(newItem)
    return JSON.parse(JSON.stringify(newItem)) as Complaint
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
}

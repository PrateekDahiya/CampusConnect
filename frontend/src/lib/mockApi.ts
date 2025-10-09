export type Complaint = {
  id: string
  category: string
  description: string
  image?: string
  status: 'Pending' | 'In Progress' | 'Resolved'
  createdAt: string
}

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// initial mock data
const initialComplaints: Complaint[] = [
  {
    id: 'c1',
    category: 'Plumbing',
    description: 'Leaking tap in block A',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
]

export const mockDb = {
  complaints: [...initialComplaints],
}

export const api = {
  async listComplaints() {
    await delay(250)
    return JSON.parse(JSON.stringify(mockDb.complaints)) as Complaint[]
  },
  async createComplaint(payload: Omit<Complaint, 'id' | 'createdAt' | 'status'>) {
    await delay(200)
    const newItem: Complaint = {
      id: Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      status: 'Pending',
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
}

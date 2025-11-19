// Real API service to connect with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types matching backend models
export type BackendComplaint = {
  _id: string;
  title: string;
  description: string;
  hostel: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  createdBy: string;
  assignedStaff?: string;
  remarks?: {
    text: string;
    addedBy: string;
    addedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type BackendUser = {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  createdAt: string;
};

// Auth token management
const getAuthToken = () => localStorage.getItem('authToken');
const setAuthToken = (token: string) => localStorage.setItem('authToken', token);
const removeAuthToken = () => localStorage.removeItem('authToken');

// API request wrapper with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      throw new Error('Authentication required');
    }
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    const err = new Error(errorData.message || `HTTP ${response.status}`) as any;
    // Attach parsed response so callers can inspect validation details
    err.responseData = errorData;
    err.status = response.status;
    throw err;
  }

  return response.json();
};

// Authentication API
export const authApi = {
  async login(email: string, password: string): Promise<{ token: string; user: BackendUser }> {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'staff' | 'admin';
  }): Promise<{ token: string; user: BackendUser }> {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ role: 'student', ...userData }),
    });
    setAuthToken(data.token);
    return data;
  },

  async getProfile(): Promise<BackendUser> {
    return apiRequest('/auth/profile');
  },

  logout() {
    removeAuthToken();
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};

// Complaints API
export const complaintsApi = {
  async getAllComplaints(): Promise<BackendComplaint[]> {
    return apiRequest('/complaints/all');
  },

  async getComplaintsByHostel(hostel: string): Promise<BackendComplaint[]> {
    return apiRequest(`/complaints/hostel/${encodeURIComponent(hostel)}`);
  },

  async createComplaint(complaint: {
    title: string;
    description: string;
    hostel: string;
  }): Promise<BackendComplaint> {
    return apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaint),
    });
  },
  async deleteComplaint(id: string): Promise<{ message: string }> {
    return apiRequest(`/complaints/${id}`, { method: 'DELETE' });
  },

  async updateComplaintStatus(
    id: string,
    status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
  ): Promise<BackendComplaint> {
    return apiRequest(`/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async addRemark(id: string, text: string): Promise<BackendComplaint> {
    return apiRequest(`/complaints/${id}/remarks`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async assignStaff(id: string, staffId: string): Promise<BackendComplaint> {
    return apiRequest(`/complaints/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ staffId }),
    });
  },
};

// Books API
export const booksApi = {
  async getBooks(filters?: {
    title?: string;
    author?: string;
    hostel?: string;
    available?: boolean;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const endpoint = `/books${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint);
  },

  async addBook(book: {
    title: string;
    author: string;
    isbn?: string;
    hostel: string;
    image?: string;
    description?: string;
  }): Promise<any> {
    return apiRequest('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  },
  async deleteBook(id: string): Promise<{ message: string }> {
    return apiRequest(`/books/${id}`, { method: 'DELETE' });
  },

  async requestBook(id: string, dueDate: string): Promise<any> {
    return apiRequest(`/books/${id}/request`, {
      method: 'POST',
      body: JSON.stringify({ dueDate }),
    });
  },

  async returnBook(id: string): Promise<any> {
    return apiRequest(`/books/${id}/return`, {
      method: 'PUT',
    });
  },

  async getMyBorrowedBooks(): Promise<any[]> {
    return apiRequest('/books/my');
  },
};

// Cycles API
export const cyclesApi = {
  async getAvailableCycles(hostel?: string): Promise<any[]> {
    const endpoint = `/cycles/available${hostel ? `?hostel=${encodeURIComponent(hostel)}` : ''}`;
    return apiRequest(endpoint);
  },

  async createCycle(cycle: {
    name: string;
    model?: string;
    hourlyRate?: number;
    dailyRate?: number;
    hostel: string;
    images?: string[];
  }): Promise<any> {
    return apiRequest('/cycles', {
      method: 'POST',
      body: JSON.stringify(cycle),
    });
  },
  async deleteCycle(id: string): Promise<{ message: string }> {
    return apiRequest(`/cycles/${id}`, { method: 'DELETE' });
  },

  async getMyCycles(): Promise<any[]> {
    return apiRequest('/cycles/my');
  },

  async editCycle(id: string, updates: any): Promise<any> {
    return apiRequest(`/cycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async setAvailability(id: string, available: boolean): Promise<any> {
    return apiRequest(`/cycles/${id}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ available }),
    });
  },
};

// Bookings API
export const bookingsApi = {
  async bookCycle(cycleId: string, startTime: string, endTime: string): Promise<any> {
    return apiRequest(`/bookings/book/${cycleId}`, {
      method: 'POST',
      body: JSON.stringify({ startTime, endTime }),
    });
  },

  async returnCycle(bookingId: string): Promise<any> {
    return apiRequest(`/bookings/return/${bookingId}`, {
      method: 'PUT',
    });
  },

  async extendBooking(bookingId: string, newEndTime: string): Promise<any> {
    return apiRequest(`/bookings/extend/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ newEndTime }),
    });
  },

  async getMyBookings(): Promise<any[]> {
    return apiRequest('/bookings/my');
  },

  async getPendingRequests(): Promise<any[]> {
    return apiRequest('/bookings/pending');
  },

  async cancelBooking(bookingId: string): Promise<any> {
    return apiRequest(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  },

  async approveBooking(bookingId: string): Promise<any> {
    return apiRequest(`/bookings/${bookingId}/approve`, {
      method: 'PUT',
    });
  },

  async rejectBooking(bookingId: string): Promise<any> {
    return apiRequest(`/bookings/${bookingId}/reject`, {
      method: 'PUT',
    });
  },
};

// Lost & Found API
export const lostFoundApi = {
  async getItems(filters?: {
    type?: 'lost' | 'found';
    location?: string;
    status?: 'open' | 'resolved';
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const endpoint = `/lostfound${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint);
  },

  async reportItem(item: {
    type: 'lost' | 'found';
    title: string;
    description: string;
    location: string;
    images?: string[];
  }): Promise<any> {
    return apiRequest('/lostfound', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  async deleteItem(id: string): Promise<{ message: string }> {
    return apiRequest(`/lostfound/${id}`, { method: 'DELETE' });
  },

  async resolveItem(id: string): Promise<any> {
    return apiRequest(`/lostfound/${id}/resolve`, {
      method: 'PUT',
    });
  },
  async markFound(id: string): Promise<any> {
    return apiRequest(`/lostfound/${id}/found`, {
      method: 'PUT',
    });
  },
  async findMatches(id: string): Promise<any[]> {
    return apiRequest(`/lostfound/${id}/matches`);
  },
  async claimItem(id: string, proof?: string): Promise<any> {
    return apiRequest(`/lostfound/${id}/claim`, {
      method: 'POST',
      body: JSON.stringify({ proof }),
    });
  },
  async approveClaim(id: string, claimId: string, approve: boolean): Promise<any> {
    return apiRequest(`/lostfound/${id}/claim/${claimId}`, {
      method: 'PUT',
      body: JSON.stringify({ approve }),
    });
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  complaints: complaintsApi,
  books: booksApi,
  cycles: cyclesApi,
  bookings: bookingsApi,
  lostFound: lostFoundApi,
};

export default api;
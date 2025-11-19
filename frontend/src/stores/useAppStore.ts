import { create } from 'zustand';
import { api, type BackendComplaint, type BackendUser } from '../lib/api';

// Convert backend complaint format to frontend format for compatibility
const convertComplaint = (backendComplaint: BackendComplaint) => ({
  id: backendComplaint._id,
  title: backendComplaint.title,
  description: backendComplaint.description,
  hostel: backendComplaint.hostel,
  status: backendComplaint.status,
  createdBy: backendComplaint.createdBy,
  createdAt: backendComplaint.createdAt,
  assignedStaff: backendComplaint.assignedStaff || '',
  remarks: backendComplaint.remarks || [],
  // Set default values for frontend-only fields
  complaintType: 'General',
  roomNumber: '',
  attachments: [],
});

type AuthState = {
  user: BackendUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role?: 'student' | 'staff' | 'admin' }) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
};

type ComplaintState = {
  complaints: any[];
  complaintsLoading: boolean;
  loadComplaints: () => Promise<void>;
  addComplaint: (complaint: { title: string; hostel: string; description: string }) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  // Placeholder functions for frontend compatibility
  addRemark: (id: string, text: string) => Promise<void>;
  assignStaff: (id: string, staffId: string) => Promise<void>;
};

type CycleState = {
  cycles: any[];
  cyclesLoading: boolean;
  myBookings: any[];
  bookingsLoading: boolean;
  pendingRequests: any[];
  pendingRequestsLoading: boolean;
  loadCycles: (filters?: { hostel?: string }) => Promise<void>;
  createCycle: (cycle: { name: string; model: string; hourlyRate: number; dailyRate: number; hostel: string; images?: string[] }) => Promise<void>;
  getMyCycles: () => Promise<void>;
  editCycle: (id: string, updates: any) => Promise<void>;
  setAvailability: (id: string, available: boolean) => Promise<void>;
  bookCycle: (cycleId: string, startTime: string, endTime: string) => Promise<void>;
  returnCycle: (bookingId: string) => Promise<void>;
  getMyBookings: () => Promise<void>;
  getPendingRequests: () => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
};

type AppState = AuthState & ComplaintState & CycleState;

export const useAppStore = create<AppState>((set) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,

  // Auth actions
  initializeAuth: async () => {
    if (!api.auth.isAuthenticated()) {
      set({ initialized: true });
      return;
    }

    set({ loading: true });
    try {
      const user = await api.auth.getProfile();
      set({ 
        user, 
        isAuthenticated: true, 
        loading: false, 
        initialized: true 
      });
    } catch (error) {
      // Token is invalid or expired
      api.auth.logout();
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        initialized: true 
      });
    }
  },
  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { user } = await api.auth.login(email, password);
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData: { name: string; email: string; password: string; role?: 'student' | 'staff' | 'admin' }) => {
    set({ loading: true });
    try {
      const { user } = await api.auth.register(userData);
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    api.auth.logout();
    set({ 
      user: null, 
      isAuthenticated: false, 
      complaints: [],
      complaintsLoading: false,
      loading: false,
      initialized: true 
    });
  },

  // Complaint state
  complaints: [],
  complaintsLoading: false,

  // Cycles state
  cycles: [],
  cyclesLoading: false,
  myBookings: [],
  bookingsLoading: false,
  pendingRequests: [],
  pendingRequestsLoading: false,

  // Complaint actions
  loadComplaints: async () => {
    const currentState = useAppStore.getState();
    if (currentState.complaintsLoading) {
      console.log('Complaints already loading, skipping request');
      return; // Prevent multiple simultaneous requests
    }
    
    console.log('Starting to load complaints');
    set({ complaintsLoading: true });
    try {
      const backendComplaints = await api.complaints.getAllComplaints();
      const complaints = backendComplaints.map(convertComplaint);
      console.log('Loaded complaints successfully:', complaints.length);
      set({ complaints, complaintsLoading: false });
    } catch (error) {
      console.log('Failed to load complaints:', error);
      set({ complaintsLoading: false });
      console.error('Failed to load complaints:', error);
      throw error;
    }
  },

  addComplaint: async (complaint: { title: string; hostel: string; description: string }) => {
    try {
      const newComplaint = await api.complaints.createComplaint(complaint);
      const convertedComplaint = convertComplaint(newComplaint);
      
      set((state) => ({
        complaints: [convertedComplaint, ...state.complaints],
      }));
    } catch (error) {
      console.error('Failed to create complaint:', error);
      throw error;
    }
  },

  updateStatus: async (id: string, status: string) => {
    try {
      const updatedComplaint = await api.complaints.updateComplaintStatus(
        id,
        status as 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
      );
      const converted = convertComplaint(updatedComplaint);
      
      set((state) => ({
        complaints: state.complaints.map((c) => 
          c.id === id ? converted : c
        ),
      }));
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      throw error;
    }
  },

  // Placeholder implementations for compatibility
  addRemark: async (id: string, text: string) => {
    try {
      const updatedComplaint = await api.complaints.addRemark(id, text);
      const converted = convertComplaint(updatedComplaint);
      
      set((state) => ({
        complaints: state.complaints.map((c) => 
          c.id === id ? converted : c
        ),
      }));
    } catch (error) {
      console.error('Failed to add remark:', error);
      throw error;
    }
  },

  assignStaff: async (id: string, staffId: string) => {
    try {
      const updatedComplaint = await api.complaints.assignStaff(id, staffId);
      const converted = convertComplaint(updatedComplaint);
      
      set((state) => ({
        complaints: state.complaints.map((c) => 
          c.id === id ? converted : c
        ),
      }));
    } catch (error) {
      console.error('Failed to assign staff:', error);
      throw error;
    }
  },

  // Cycle actions
  loadCycles: async (filters?: { hostel?: string }) => {
    set({ cyclesLoading: true });
    try {
      const cycles = await api.cycles.getAvailableCycles(filters?.hostel);
      set({ cycles, cyclesLoading: false });
    } catch (error) {
      console.error('Failed to load cycles:', error);
      set({ cyclesLoading: false });
      throw error;
    }
  },

  createCycle: async (cycle: { name: string; model: string; hourlyRate: number; dailyRate: number; hostel: string; images?: string[] }) => {
    try {
      const newCycle = await api.cycles.createCycle(cycle);
      set((state) => ({
        cycles: [...state.cycles, newCycle],
      }));
    } catch (error) {
      console.error('Failed to create cycle:', error);
      throw error;
    }
  },

  getMyCycles: async () => {
    try {
      const myCycles = await api.cycles.getMyCycles();
      set({ cycles: myCycles });
    } catch (error) {
      console.error('Failed to get my cycles:', error);
      throw error;
    }
  },

  editCycle: async (id: string, updates: any) => {
    try {
      const updatedCycle = await api.cycles.editCycle(id, updates);
      set((state) => ({
        cycles: state.cycles.map((c) => 
          c._id === id ? updatedCycle : c
        ),
      }));
    } catch (error) {
      console.error('Failed to edit cycle:', error);
      throw error;
    }
  },

  setAvailability: async (id: string, available: boolean) => {
    try {
      const updatedCycle = await api.cycles.setAvailability(id, available);
      set((state) => ({
        cycles: state.cycles.map((c) => 
          c._id === id ? updatedCycle : c
        ),
      }));
    } catch (error) {
      console.error('Failed to set availability:', error);
      throw error;
    }
  },

  bookCycle: async (cycleId: string, startTime: string, endTime: string) => {
    try {
      const booking = await api.bookings.bookCycle(cycleId, startTime, endTime);
      set((state) => ({
        myBookings: [...state.myBookings, booking],
      }));
    } catch (error) {
      console.error('Failed to book cycle:', error);
      throw error;
    }
  },

  returnCycle: async (bookingId: string) => {
    try {
      await api.bookings.returnCycle(bookingId);
      set((state) => ({
        myBookings: state.myBookings.filter((b) => b._id !== bookingId),
      }));
    } catch (error) {
      console.error('Failed to return cycle:', error);
      throw error;
    }
  },

  getMyBookings: async () => {
    set({ bookingsLoading: true });
    try {
      const bookings = await api.bookings.getMyBookings();
      set({ myBookings: bookings, bookingsLoading: false });
    } catch (error) {
      console.error('Failed to get bookings:', error);
      set({ bookingsLoading: false });
      throw error;
    }
  },

  getPendingRequests: async () => {
    set({ pendingRequestsLoading: true });
    try {
      const requests = await api.bookings.getPendingRequests();
      set({ pendingRequests: requests, pendingRequestsLoading: false });
    } catch (error) {
      console.error('Failed to get pending requests:', error);
      set({ pendingRequestsLoading: false });
      throw error;
    }
  },

  approveBooking: async (bookingId: string) => {
    try {
      await api.bookings.approveBooking(bookingId);
      // Refresh pending requests and bookings
      const currentState = useAppStore.getState();
      await currentState.getPendingRequests();
      await currentState.getMyBookings();
      await currentState.loadCycles();
    } catch (error) {
      console.error('Failed to approve booking:', error);
      throw error;
    }
  },

  rejectBooking: async (bookingId: string) => {
    try {
      await api.bookings.rejectBooking(bookingId);
      // Refresh pending requests
      const currentState = useAppStore.getState();
      await currentState.getPendingRequests();
    } catch (error) {
      console.error('Failed to reject booking:', error);
      throw error;
    }
  },

  cancelBooking: async (bookingId: string) => {
    try {
      await api.bookings.cancelBooking(bookingId);
      // Refresh user's bookings
      const currentState = useAppStore.getState();
      await currentState.getMyBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  },
}));

export default useAppStore;
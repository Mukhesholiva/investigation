
const API_BASE_URL = 'https://diagnostics.olivaclinic.com/backend';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  centers: string[];
}

export interface Guest {
  GuestName: string;
  Gender: string;
  GuestCode: string;
  Phone: string;
  Date: string;
  Center: string;
  TestStatus: string;
  Status: string;
  ReportURL: string;
  BookingID: string;
  ItemValueSum: number;
}

export interface SlotBooking {
  GuestCode: string;
  Date: string;
  Age: string;
  Address: string;
}

export interface NewSlotBooking {
  guest_code: string;
  Date: string;
  age: number;
  address: string;
  door_no: string;
  pincode: string;
  time_slot: string;
}

export interface RescheduleBooking {
  guest_code: string;
  confirmed_date: string;
  confirmed_time_slot: string;
}

export interface InvestigationData {
  investigations: any[];
  guest_summary: any[];
  total_clients: number;
  month_value: number;
  crt_value_data: any[];
  daywise_clients: any[];
  mom_clients: any[];
}

export interface AvailableSlots {
  status: boolean;
  message: string;
  slots: string[];
}

class ApiService {
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getGuests(centers: string[]): Promise<Guest[]> {
    return this.makeRequest<Guest[]>('/guests', {
      method: 'POST',
      body: JSON.stringify({ centers }),
    });
  }

  async getSlotBookings(guestCode: string): Promise<{ data: SlotBooking[] }> {
    return this.makeRequest<{ data: SlotBooking[] }>(
      `/get-slot-bookings?guestCode=${encodeURIComponent(guestCode)}`
    );
  }

  async updateBookingStatus(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/update-booking-status', {
      method: 'POST',
    });
  }

  async saveSlotBookings(bookings: NewSlotBooking[]): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/slot-bookings', {
      method: 'POST',
      body: JSON.stringify(bookings),
    });
  }

  async rescheduleBooking(booking: RescheduleBooking): Promise<{
    status: string;
    message: string;
    data: any[];
  }> {
    return this.makeRequest('/reschedule-booking', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async getBookingDetails(guestCode: string): Promise<{ status: string }> {
    return this.makeRequest('/booking-details-by-guest-code', {
      method: 'POST',
      body: JSON.stringify({ guest_code: guestCode }),
    });
  }

  async getInvestigations(centers: string[]): Promise<InvestigationData> {
    return this.makeRequest<InvestigationData>('/investigations', {
      method: 'POST',
      body: JSON.stringify({ centers }),
    });
  }

  async getAvailableSlots(pincode: string, appointmentDate: string): Promise<AvailableSlots> {
    return this.makeRequest<AvailableSlots>('/get-available-slots', {
      method: 'POST',
      body: JSON.stringify({
        pincode,
        appointment_date: appointmentDate,
      }),
    });
  }
}

export const apiService = new ApiService();

import axios from 'axios';

const API_BASE = 'https://diagnostics.olivaclinic.com/backend';

/**
 * Fetch lab reports from Oncquest backend via FastAPI
 * @param req - { fromDate, toDate }
 * @param token - authentication token
 */
export async function fetchLabReports(req: { fromDate: string; toDate: string }, token: string): Promise<any[]> {
  const res = await axios.post(`${API_BASE}/api/fetch-all-reports`, req, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

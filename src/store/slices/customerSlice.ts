import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  photo_url: string | null;
  due_amount: number;
  created_at: string;
  updated_at: string;
  send_email_notifications: boolean;
  send_sms_notifications: boolean;
}

interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
      state.lastUpdated = Date.now();
    },
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload;
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      if (state.currentCustomer?.id === action.payload.id) {
        state.currentCustomer = action.payload;
      }
      state.lastUpdated = Date.now();
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.unshift(action.payload);
      state.lastUpdated = Date.now();
    },
    removeCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
      if (state.currentCustomer?.id === action.payload) {
        state.currentCustomer = null;
      }
      state.lastUpdated = Date.now();
    },
    updateCustomerBalance: (state, action: PayloadAction<{ customerId: string; due_amount: number }>) => {
      const { customerId, due_amount } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.due_amount = due_amount;
        customer.updated_at = new Date().toISOString();
      }
      if (state.currentCustomer?.id === customerId) {
        state.currentCustomer.due_amount = due_amount;
        state.currentCustomer.updated_at = new Date().toISOString();
      }
      state.lastUpdated = Date.now();
    },
  },
});

export const {
  setLoading,
  setError,
  setCustomers,
  setCurrentCustomer,
  updateCustomer,
  addCustomer,
  removeCustomer,
  updateCustomerBalance,
} = customerSlice.actions;

export default customerSlice.reducer;

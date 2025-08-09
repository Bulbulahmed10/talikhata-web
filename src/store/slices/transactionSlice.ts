import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  type: "given" | "received";
  amount: number;
  note: string;
  date: string;
  time: string;
  due_date: string | null;
  refund_amount: number;
  refund_note: string | null;
  created_at: string;
  customer_id: string;
  user_id: string;
}

interface TransactionState {
  transactions: Transaction[];
  currentCustomerTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: TransactionState = {
  transactions: [],
  currentCustomerTransactions: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.lastUpdated = Date.now();
    },
    setCurrentCustomerTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.currentCustomerTransactions = action.payload;
      state.lastUpdated = Date.now();
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      state.currentCustomerTransactions.unshift(action.payload);
      state.lastUpdated = Date.now();
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const { id } = action.payload;
      const transactionIndex = state.transactions.findIndex(t => t.id === id);
      const currentIndex = state.currentCustomerTransactions.findIndex(t => t.id === id);
      
      if (transactionIndex !== -1) {
        state.transactions[transactionIndex] = action.payload;
      }
      if (currentIndex !== -1) {
        state.currentCustomerTransactions[currentIndex] = action.payload;
      }
      state.lastUpdated = Date.now();
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
      state.currentCustomerTransactions = state.currentCustomerTransactions.filter(t => t.id !== action.payload);
      state.lastUpdated = Date.now();
    },
    clearCurrentCustomerTransactions: (state) => {
      state.currentCustomerTransactions = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setTransactions,
  setCurrentCustomerTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  clearCurrentCustomerTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;

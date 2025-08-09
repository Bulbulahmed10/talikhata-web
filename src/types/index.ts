// Customer related types
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

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  send_email_notifications: boolean;
  send_sms_notifications: boolean;
}

// Transaction related types
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
  reminder_type?: "email" | "sms" | "both";
  created_at: string;
  customer_id: string;
  customers?: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface TransactionFormData {
  type: "given" | "received";
  amount: string;
  note: string;
  date: string;
  time: string;
  due_date: string;
  reminder_type: "email" | "sms" | "both";
  refund_amount: string;
  refund_note: string;
}

// Report related types
export interface ReportStats {
  netReceivable: number;
  netPayable: number;
  totalCustomers: number;
  customersWithDue: number;
}

// UI related types
export type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "received" | "given";
export type FilterOption = "all" | "received" | "given";

// Animation types
export type AnimationType = "customer-loaded" | "transactions-loaded" | "transaction-added" | "transaction-deleted" | "transaction-updated";

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Notification types
export interface NotificationSettings {
  email: boolean;
  sms: boolean;
}

// Date and time formatting
export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  showTime?: boolean;
  showYear?: boolean;
}

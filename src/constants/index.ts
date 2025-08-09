// Currency and formatting constants
export const CURRENCY = {
  CODE: 'BDT',
  LOCALE: 'bn-BD',
  SYMBOL: '৳',
} as const;

// Date and time constants
export const DATE_FORMATS = {
  DISPLAY: 'dd MMMM, yyyy',
  INPUT: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DUE_DATE: 'dd/MM/yyyy',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  GIVEN: 'given',
  RECEIVED: 'received',
} as const;

// Sort options
export const SORT_OPTIONS = {
  DATE_DESC: 'date-desc',
  DATE_ASC: 'date-asc',
  AMOUNT_DESC: 'amount-desc',
  AMOUNT_ASC: 'amount-asc',
  RECEIVED: 'received',
  GIVEN: 'given',
} as const;

// Filter options
export const FILTER_OPTIONS = {
  ALL: 'all',
  RECEIVED: 'received',
  GIVEN: 'given',
} as const;

// Animation constants
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
} as const;

export const ANIMATION_DELAY = {
  SMALL: 0.1,
  MEDIUM: 0.2,
  LARGE: 0.3,
} as const;

// API constants
export const API_ENDPOINTS = {
  CUSTOMERS: 'customers',
  TRANSACTIONS: 'transactions',
  REPORTS: 'reports',
} as const;

// UI constants
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

// Validation constants
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999,
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  BOTH: 'both',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_AMOUNT: 'Please enter a valid amount',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CUSTOMER_CREATED: 'Customer created successfully',
  CUSTOMER_UPDATED: 'Customer updated successfully',
  CUSTOMER_DELETED: 'Customer deleted successfully',
  TRANSACTION_CREATED: 'Transaction created successfully',
  TRANSACTION_UPDATED: 'Transaction updated successfully',
  TRANSACTION_DELETED: 'Transaction deleted successfully',
  BALANCE_UPDATED: 'Balance updated successfully',
} as const;

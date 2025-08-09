import { CURRENCY, DATE_FORMATS } from '@/constants';

/**
 * Format currency amount with Bengali locale
 */
export const formatCurrency = (amount: number, options?: { showSymbol?: boolean }): string => {
  const { showSymbol = true } = options || {};
  
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

/**
 * Format amount without currency symbol
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string, options?: { showTime?: boolean; showYear?: boolean }): string => {
  const { showTime = false, showYear = true } = options || {};
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: showYear ? 'numeric' : undefined,
    hour: showTime ? 'numeric' : undefined,
    minute: showTime ? 'numeric' : undefined,
    second: showTime ? 'numeric' : undefined,
    hour12: showTime,
  });

  return formatter.format(date);
};

/**
 * Format time for display
 */
export const formatTime = (dateString: string, timeString: string): string => {
  const date = new Date(`${dateString}T${timeString}`);
  
  if (isNaN(date.getTime())) {
    return 'Invalid time';
  }

  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  // If less than 24 hours, show relative time
  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    }
    return `${Math.floor(diffInHours)} hours ago`;
  }

  // Otherwise show formatted date and time
  return formatDate(dateString, { showTime: true, showYear: true });
};

/**
 * Format due date for display
 */
export const formatDueDate = (dueDate: string | null): string => {
  if (!dueDate) return '';
  
  const date = new Date(dueDate);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Bangladeshi phone number
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

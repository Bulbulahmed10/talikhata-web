import { VALIDATION } from '@/constants';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationError | null => {
  if (!value || value.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }
  return null;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Please enter a valid email address',
    };
  }
  return null;
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): ValidationError | null => {
  const phoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
  if (phone && !phoneRegex.test(phone)) {
    return {
      field: 'phone',
      message: 'Please enter a valid Bangladeshi phone number',
    };
  }
  return null;
};

/**
 * Validate name length
 */
export const validateName = (name: string): ValidationError | null => {
  if (name.length < VALIDATION.MIN_NAME_LENGTH) {
    return {
      field: 'name',
      message: `Name must be at least ${VALIDATION.MIN_NAME_LENGTH} characters long`,
    };
  }
  if (name.length > VALIDATION.MAX_NAME_LENGTH) {
    return {
      field: 'name',
      message: `Name must be less than ${VALIDATION.MAX_NAME_LENGTH} characters`,
    };
  }
  return null;
};

/**
 * Validate amount
 */
export const validateAmount = (amount: number): ValidationError | null => {
  if (amount < VALIDATION.MIN_AMOUNT) {
    return {
      field: 'amount',
      message: `Amount must be at least ${VALIDATION.MIN_AMOUNT}`,
    };
  }
  if (amount > VALIDATION.MAX_AMOUNT) {
    return {
      field: 'amount',
      message: `Amount must be less than ${VALIDATION.MAX_AMOUNT}`,
    };
  }
  return null;
};

/**
 * Validate form data
 */
export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => ValidationError | null>): ValidationResult => {
  const errors: ValidationError[] = [];

  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(data[field]);
    if (error) {
      errors.push(error);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

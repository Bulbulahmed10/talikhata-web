import { useState, useCallback } from "react";
import { ValidationError } from "@/types";
import { validateForm } from "@/utils/validation";

interface UseFormOptions<T> {
  initialData: T;
  validateFunction?: (data: T) => ValidationError[];
  onSubmit?: (data: T) => Promise<void>;
}

interface UseFormReturn<T> {
  data: T;
  errors: ValidationError[];
  loading: boolean;
  setData: (data: T) => void;
  updateField: (field: keyof T, value: unknown) => void;
  validate: () => boolean;
  submit: () => Promise<void>;
  reset: () => void;
  getFieldError: (field: string) => string | null;
  hasErrors: boolean;
}

export const useForm = <T extends Record<string, unknown>>({
  initialData,
  validateFunction,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);

  const updateField = useCallback((field: keyof T, value: unknown) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when user starts typing
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  const validate = useCallback(() => {
    if (!validateFunction) return true;
    
    const validationErrors = validateFunction(data);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }, [data, validateFunction]);

  const submit = useCallback(async () => {
    if (!onSubmit) return;
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  }, [data, onSubmit, validate]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors([]);
    setLoading(false);
  }, [initialData]);

  const getFieldErrorMessage = useCallback((field: string) => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  }, [errors]);

  return {
    data,
    errors,
    loading,
    setData,
    updateField,
    validate,
    submit,
    reset,
    getFieldError: getFieldErrorMessage,
    hasErrors: errors.length > 0,
  };
};

// Specific form hooks for common use cases
export const useCustomerForm = (initialData: Record<string, unknown>, onSubmit?: (data: Record<string, unknown>) => Promise<void>) => {
  const validateCustomerData = (data: Record<string, unknown>) => {
    const rules = {
      name: (value: unknown) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return { field: 'name', message: 'Name is required' };
        }
        return null;
      },
      phone: (value: unknown) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return { field: 'phone', message: 'Phone is required' };
        }
        return null;
      }
    };
    
    const result = validateForm(data, rules);
    return result.errors;
  };

  return useForm({
    initialData,
    validateFunction: validateCustomerData,
    onSubmit,
  });
};

export const useTransactionForm = (initialData: Record<string, unknown>, onSubmit?: (data: Record<string, unknown>) => Promise<void>) => {
  return useForm({
    initialData,
    validateFunction: validateTransactionForm,
    onSubmit,
  });
};

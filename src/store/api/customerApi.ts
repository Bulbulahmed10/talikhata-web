import { createApi } from '@reduxjs/toolkit/query/react';
import type { Customer } from '../slices/customerSlice';
import { customersApi, type CustomerDto } from '@/lib/api';

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: async () => ({ data: {} as unknown as any }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], void>({
      queryFn: async () => {
        try {
          const res = await customersApi.list({ limit: 100 });
          const mapped: Customer[] = (res.data || []).map((c: CustomerDto) => ({
            id: c._id,
            name: c.name,
            phone: (c.phone as string) || null,
            email: (c.email as string) || null,
            address: (c.address as string) || null,
            description: (c.description as string) || null,
            photo_url: (c.photo_url as string) || null,
            due_amount: c.due_amount ?? 0,
            created_at: (c as any).createdAt || new Date().toISOString(),
            updated_at: (c as any).updatedAt || new Date().toISOString(),
            send_email_notifications: true,
            send_sms_notifications: false,
          }));
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: ['Customer'],
    }),
    getCustomer: builder.query<Customer, string>({
      queryFn: async (id) => {
        try {
          const res = await customersApi.get(id);
          const c = res.data;
          const mapped: Customer = {
            id: c._id,
            name: c.name,
            phone: (c.phone as string) || null,
            email: (c.email as string) || null,
            address: (c.address as string) || null,
            description: (c.description as string) || null,
            photo_url: (c.photo_url as string) || null,
            due_amount: c.due_amount ?? 0,
            created_at: (c as any).createdAt || new Date().toISOString(),
            updated_at: (c as any).updatedAt || new Date().toISOString(),
            send_email_notifications: true,
            send_sms_notifications: false,
          };
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      queryFn: async (customerData) => {
        try {
          const res = await customersApi.create(customerData as any);
          const c = res.data;
          const mapped: Customer = {
            id: c._id,
            name: c.name,
            phone: (c.phone as string) || null,
            email: (c.email as string) || null,
            address: (c.address as string) || null,
            description: (c.description as string) || null,
            photo_url: (c.photo_url as string) || null,
            due_amount: c.due_amount ?? 0,
            created_at: (c as any).createdAt || new Date().toISOString(),
            updated_at: (c as any).updatedAt || new Date().toISOString(),
            send_email_notifications: true,
            send_sms_notifications: false,
          };
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: builder.mutation<Customer, { id: string; data: Partial<Customer> }>({
      queryFn: async ({ id, data }) => {
        try {
          const res = await customersApi.update(id, data as any);
          const c = res.data;
          const mapped: Customer = {
            id: c._id,
            name: c.name,
            phone: (c.phone as string) || null,
            email: (c.email as string) || null,
            address: (c.address as string) || null,
            description: (c.description as string) || null,
            photo_url: (c.photo_url as string) || null,
            due_amount: c.due_amount ?? 0,
            created_at: (c as any).createdAt || new Date().toISOString(),
            updated_at: (c as any).updatedAt || new Date().toISOString(),
            send_email_notifications: true,
            send_sms_notifications: false,
          };
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id },
        'Customer'
      ],
    }),
    deleteCustomer: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await customersApi.remove(id);
          return { data: undefined } as any;
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: ['Customer'],
    }),
    updateCustomerBalance: builder.mutation<Customer, { customerId: string; due_amount: number }>({
      queryFn: async ({ customerId, due_amount }) => {
        try {
          const res = await customersApi.update(customerId, { due_amount } as any);
          const c = res.data;
          const mapped: Customer = {
            id: c._id,
            name: c.name,
            phone: (c.phone as string) || null,
            email: (c.email as string) || null,
            address: (c.address as string) || null,
            description: (c.description as string) || null,
            photo_url: (c.photo_url as string) || null,
            due_amount: c.due_amount ?? 0,
            created_at: (c as any).createdAt || new Date().toISOString(),
            updated_at: (c as any).updatedAt || new Date().toISOString(),
            send_email_notifications: true,
            send_sms_notifications: false,
          };
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId },
        'Customer'
      ],
    }),
    getStats: builder.query<{
      netReceivable: number;
      netPayable: number;
      totalCustomers: number;
      customersWithDue: number;
    }, void>({
      queryFn: async () => {
        try {
          // Derive stats from customers list
          const res = await customersApi.list({ limit: 1000 });
          const customers = res.data || [];
          const totals = customers.reduce(
            (acc, c) => {
              const due = c.due_amount || 0;
              if (due > 0) {
                acc.netReceivable += due;
                acc.customersWithDue += 1;
              } else if (due < 0) {
                acc.netPayable += Math.abs(due);
              }
              return acc;
            },
            { netReceivable: 0, netPayable: 0, customersWithDue: 0 }
          );
          return {
            data: {
              netReceivable: totals.netReceivable,
              netPayable: totals.netPayable,
              totalCustomers: customers.length,
              customersWithDue: totals.customersWithDue,
            }
          } as any;
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: ['Customer'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useUpdateCustomerBalanceMutation,
  useGetStatsQuery,
} = customerApi;

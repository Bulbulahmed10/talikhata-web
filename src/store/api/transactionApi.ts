import { createApi } from '@reduxjs/toolkit/query/react';
import type { Transaction } from '../slices/transactionSlice';
import { transactionsApi, type TransactionDto } from '@/lib/api';

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: async () => ({ data: {} as unknown as any }),
  tagTypes: ['Transaction'],
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      queryFn: async () => {
        try {
          const res = await transactionsApi.list({ limit: 100 });
          const mapped: Transaction[] = (res.data || []).map((t: TransactionDto) => ({
            id: (t as any)._id,
            type: t.type,
            amount: t.amount,
            note: (t.note as string) || '',
            date: new Date(t.date).toISOString().slice(0, 10),
            time: t.time,
            due_date: (t.due_date as string | null) || null,
            refund_amount: t.refund_amount || 0,
            refund_note: null,
            created_at: (t as any).createdAt || new Date().toISOString(),
            customer_id: typeof t.customer === 'string' ? t.customer : (t.customer as any)._id,
          }));
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: ['Transaction'],
    }),
    getCustomerTransactions: builder.query<Transaction[], string>({
      queryFn: async (customerId) => {
        try {
          const res = await transactionsApi.list({ limit: 200, customerId });
          const mapped: Transaction[] = (res.data || []).map((t: TransactionDto) => ({
            id: (t as any)._id,
            type: t.type,
            amount: t.amount,
            note: (t.note as string) || '',
            date: new Date(t.date).toISOString().slice(0, 10),
            time: t.time,
            due_date: (t.due_date as string | null) || null,
            refund_amount: t.refund_amount || 0,
            refund_note: null,
            created_at: (t as any).createdAt || new Date().toISOString(),
            customer_id: typeof t.customer === 'string' ? t.customer : (t.customer as any)._id,
          }));
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (result, error, customerId) => [
        { type: 'Transaction', id: customerId }
      ],
    }),
    createTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      queryFn: async (transactionData) => {
        try {
          const payload: any = {
            customer: transactionData.customer_id,
            type: transactionData.type,
            amount: transactionData.amount,
            refund_amount: transactionData.refund_amount || 0,
            note: transactionData.note,
            date: transactionData.date,
            time: transactionData.time,
            due_date: transactionData.due_date,
          };
          const res = await transactionsApi.create(payload);
          const t = res.data;
          const mapped: Transaction = {
            id: (t as any)._id,
            type: t.type,
            amount: t.amount,
            note: (t.note as string) || '',
            date: new Date(t.date).toISOString().slice(0, 10),
            time: t.time,
            due_date: (t.due_date as string | null) || null,
            refund_amount: t.refund_amount || 0,
            refund_note: null,
            created_at: (t as any).createdAt || new Date().toISOString(),
            customer_id: typeof t.customer === 'string' ? t.customer : (t.customer as any)._id,
          };
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: (result, error, transaction) => [
        { type: 'Transaction', id: transaction.customer_id },
        'Transaction'
      ],
      async onQueryStarted(transactionData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(transactionApi.util.invalidateTags([{ type: 'Transaction', id: transactionData.customer_id }]));
        } catch {}
      },
    }),
    updateTransaction: builder.mutation<Transaction, { id: string; data: Partial<Transaction> }>({
      queryFn: async ({ id, data }) => {
        try {
          const payload: any = {
            type: data.type,
            amount: data.amount,
            refund_amount: data.refund_amount,
            note: data.note,
            date: data.date,
            time: data.time,
            due_date: data.due_date,
          };
          const res = await transactionsApi.update(id, payload);
          const t = res.data;
          const mapped: Transaction = {
            id: (t as any)._id,
            type: t.type,
            amount: t.amount,
            note: (t.note as string) || '',
            date: new Date(t.date).toISOString().slice(0, 10),
            time: t.time,
            due_date: (t.due_date as string | null) || null,
            refund_amount: t.refund_amount || 0,
            refund_note: null,
            created_at: (t as any).createdAt || new Date().toISOString(),
            customer_id: typeof t.customer === 'string' ? t.customer : (t.customer as any)._id,
          };
          return { data: mapped };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Transaction', id },
        'Transaction'
      ],
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(transactionApi.util.invalidateTags([{ type: 'Transaction', id: data.customer_id }]));
        } catch {}
      },
    }),
    deleteTransaction: builder.mutation<void, { id: string; customerId: string }>({
      queryFn: async ({ id }) => {
        try {
          await transactionsApi.remove(id);
          return { data: undefined } as any;
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Transaction', id: customerId },
        'Transaction'
      ],
      async onQueryStarted({ customerId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(transactionApi.util.invalidateTags([{ type: 'Transaction', id: customerId }]));
        } catch {}
      },
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetCustomerTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;

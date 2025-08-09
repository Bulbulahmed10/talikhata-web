import { useState, useEffect, useCallback } from "react";
import { transactionsApi, type TransactionDto } from "@/lib/api";
import { Transaction, SortOption, FilterOption } from "@/types";
import { SORT_OPTIONS, FILTER_OPTIONS } from "@/constants";

interface UseTransactionsOptions {
  customerId?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  sortTransactions: (sortBy: SortOption) => void;
  filterTransactions: (filterBy: FilterOption) => void;
  sortedTransactions: Transaction[];
  filteredTransactions: Transaction[];
}

export const useTransactions = (options: UseTransactionsOptions = {}): UseTransactionsReturn => {
  const { customerId, limit, autoFetch = true } = options;
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.DATE_DESC);
  const [filterBy, setFilterBy] = useState<FilterOption>(FILTER_OPTIONS.ALL);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await transactionsApi.list({ limit: limit || 100, customerId });
      const data = (res.data || []) as TransactionDto[];
      const mapped: Transaction[] = data.map((t) => ({
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
        customer_id: typeof t.customer === 'string' ? (t.customer as string) : ((t.customer as any)._id as string),
        customers: typeof t.customer === 'object' ? {
          id: (t.customer as any)._id,
          name: (t.customer as any).name,
          phone: (t.customer as any).phone || null,
        } : undefined,
      }));

      setTransactions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [customerId, limit]);

  const sortTransactions = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
  }, []);

  const filterTransactions = useCallback((newFilterBy: FilterOption) => {
    setFilterBy(newFilterBy);
  }, []);

  // Sort transactions based on current sort option
  const sortedTransactions = useCallback(() => {
    const sorted = [...transactions];
    
    switch (sortBy) {
      case SORT_OPTIONS.DATE_DESC:
        return sorted.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
      case SORT_OPTIONS.DATE_ASC:
        return sorted.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
      case SORT_OPTIONS.AMOUNT_DESC:
        return sorted.sort((a, b) => b.amount - a.amount);
      case SORT_OPTIONS.AMOUNT_ASC:
        return sorted.sort((a, b) => a.amount - b.amount);
      case SORT_OPTIONS.RECEIVED:
        return sorted.filter(t => t.type === 'received');
      case SORT_OPTIONS.GIVEN:
        return sorted.filter(t => t.type === 'given');
      default:
        return sorted;
    }
  }, [transactions, sortBy]);

  // Filter transactions based on current filter option
  const filteredTransactions = useCallback(() => {
    const sorted = sortedTransactions();
    
    switch (filterBy) {
      case FILTER_OPTIONS.RECEIVED:
        return sorted.filter(t => t.type === 'received');
      case FILTER_OPTIONS.GIVEN:
        return sorted.filter(t => t.type === 'given');
      default:
        return sorted;
    }
  }, [sortedTransactions, filterBy]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, [fetchTransactions, autoFetch]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    sortTransactions,
    filterTransactions,
    sortedTransactions: sortedTransactions(),
    filteredTransactions: filteredTransactions(),
  };
};
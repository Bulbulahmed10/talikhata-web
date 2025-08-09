import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('transactions')
        .select(`
          *,
          customers (
            id,
            name,
            phone
          )
        `)
        .eq('user_id', user.id);

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTransactions(data || []);
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
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case SORT_OPTIONS.DATE_ASC:
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
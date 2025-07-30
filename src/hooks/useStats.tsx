import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalGiven: number;
  totalReceived: number;
  totalCustomers: number;
  customersWithDue: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalGiven: 0,
    totalReceived: 0,
    totalCustomers: 0,
    customersWithDue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);

    // Get transaction stats
    const { data: givenData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'given');

    const { data: receivedData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'received');

    // Get customer stats
    const { data: customersData } = await supabase
      .from('customers')
      .select('due_amount');

    if (givenData && receivedData && customersData) {
      const totalGiven = givenData.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalReceived = receivedData.reduce((sum, t) => sum + Number(t.amount), 0);
      const customersWithDue = customersData.filter(c => Number(c.due_amount) > 0).length;

      setStats({
        totalGiven,
        totalReceived,
        totalCustomers: customersData.length,
        customersWithDue,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};
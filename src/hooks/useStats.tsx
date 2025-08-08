import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  netReceivable: number;
  netPayable: number;
  totalCustomers: number;
  customersWithDue: number;
}
console.log({supabase})
export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    netReceivable: 0,
    netPayable: 0,
    totalCustomers: 0,
    customersWithDue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setStats({
        netReceivable: 0,
        netPayable: 0,
        totalCustomers: 0,
        customersWithDue: 0,
      });
      setLoading(false);
      return;
    }

    // Get customer stats only
    const { data: customersData } = await supabase
      .from('customers')
      .select('due_amount')
      .eq('user_id', user.id);

    if (customersData) {
      const netReceivable = customersData
        .filter(c => Number(c.due_amount) > 0)
        .reduce((sum, c) => sum + Number(c.due_amount), 0);
      const netPayable = customersData
        .filter(c => Number(c.due_amount) < 0)
        .reduce((sum, c) => sum + Math.abs(Number(c.due_amount)), 0);
      const customersWithDue = customersData.filter(c => Number(c.due_amount) > 0).length;

      setStats({
        netReceivable,
        netPayable,
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
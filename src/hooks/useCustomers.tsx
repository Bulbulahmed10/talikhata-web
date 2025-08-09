import { useState, useEffect } from "react";
import { customersApi } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  due_amount: number;
  updated_at: string;
  photo_url?: string | null;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersApi.list({ limit: 10 });
      const data = res.data || [];
      // Map to expected shape
      setCustomers(
        data.map((c: any) => ({
          id: c._id,
          name: c.name,
          phone: c.phone || null,
          due_amount: c.due_amount ?? 0,
          updated_at: c.updatedAt || new Date().toISOString(),
          photo_url: c.photo_url || null,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, refetch: fetchCustomers };
};
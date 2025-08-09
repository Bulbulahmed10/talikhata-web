import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Phone, Edit, Trash2, Search, User, Mail, MapPin, Loader2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { customersApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import CustomerForm from "@/components/CustomerForm";
import { useAuth } from "@/hooks/useAuth";
import { Customer } from "@/types";
import { formatCurrency, getInitials } from "@/utils/formatters";
import { CustomerCard, SearchAndFilter } from "@/components/common";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const { customers, loading: customersLoading, refetch } = useCustomers();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const handleCustomerSuccess = () => {
    setShowAddDialog(false);
    setEditingCustomer(null);
    refetch();
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await customersApi.remove(customerId);

      toast({
        title: "সফল!",
        description: "গ্রাহক মুছে ফেলা হয়েছে।",
      });
      
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "গ্রাহক মুছতে সমস্যা হয়েছে।";
      toast({
        title: "ত্রুটি",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">গ্রাহক ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সকল গ্রাহকের তালিকা ও ব্যবস্থাপনা</p>
        </div>
        
        <Button 
          className="gap-2" 
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4" />
          নতুন গ্রাহক
        </Button>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="গ্রাহক খুঁজুন..."
        className="mb-6"
        showSortAndFilter={false}
      />

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {authLoading || customersLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p>কোনো গ্রাহক পাওয়া যায়নি</p>
            <p className="text-sm">নতুন গ্রাহক যোগ করুন</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={() => navigate(`/customers/${customer.id}`)}
              onEdit={() => handleEditCustomer(customer)}
              onDelete={() => handleDeleteCustomer(customer.id)}
              showActions={true}
            />
          ))
        )}
      </div>

      {/* Customer Form Dialogs */}
      <CustomerForm
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleCustomerSuccess}
        mode="add"
      />
      
      <CustomerForm
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
        onSuccess={handleCustomerSuccess}
        mode="edit"
      />
    </div>
  );
};

export default Customers; 
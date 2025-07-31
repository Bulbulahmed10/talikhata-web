import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Phone, TrendingUp, TrendingDown, Loader2, Send, Mail, MapPin, User, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import CustomerForm from "@/components/CustomerForm";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  photo_url: string | null;
  due_amount: number;
  created_at: string;
  updated_at: string;
  send_email_notifications: boolean;
  send_sms_notifications: boolean;
}

interface Transaction {
  id: string;
  type: "given" | "received";
  amount: number;
  note: string;
  date: string;
  created_at: string;
}

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    type: "given" as "given" | "received",
    amount: "",
    note: "",
    date: new Date().toISOString().split('T')[0]
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('');
  };

  const fetchCustomerData = async () => {
    if (!id) return;
    
    setLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (customerError) throw customerError;
      setCustomer({
        ...customerData,
        email: (customerData as any).email || null,
        address: (customerData as any).address || null,
        description: (customerData as any).description || null,
        photo_url: (customerData as any).photo_url || null,
        send_email_notifications: (customerData as any).send_email_notifications ?? true,
        send_sms_notifications: (customerData as any).send_sms_notifications ?? false,
      } as Customer);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', id)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions((transactionsData || []) as Transaction[]);
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchCustomerData();
    }
  }, [id, user, authLoading]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          customer_id: id,
          type: newTransaction.type,
          amount: parseFloat(newTransaction.amount),
          note: newTransaction.note,
          date: newTransaction.date
        }]);

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "নতুন লেনদেন যোগ করা হয়েছে।",
      });
      
      setNewTransaction({
        type: "given",
        amount: "",
        note: "",
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddDialog(false);
      fetchCustomerData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleCustomerSuccess = () => {
    setShowEditDialog(false);
    fetchCustomerData(); // Refresh customer data
  };

  const handleSendReminder = async () => {
    if (!customer?.phone) {
      toast({
        title: "ত্রুটি",
        description: "গ্রাহকের ফোন নম্বর নেই।",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "রিমাইন্ডার পাঠানো হয়েছে",
      description: `${customer.name} কে রিমাইন্ডার পাঠানো হয়েছে।`,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">গ্রাহক পাওয়া যায়নি</h2>
          <Button onClick={() => navigate("/customers")}>
            ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/customers")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              ফিরে যান
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={customer.photo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {customer.photo_url ? <User className="h-8 w-8" /> : getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
                <div className="space-y-1">
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              সম্পাদনা করুন
            </Button>
            {customer.due_amount > 0 && customer.phone && (
              <Button variant="outline" onClick={handleSendReminder}>
                <Send className="h-4 w-4 mr-2" />
                রিমাইন্ডার পাঠান
              </Button>
            )}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  নতুন লেনদেন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন লেনদেন যোগ করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="space-y-2">
                    <Label>লেনদেনের ধরন</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={newTransaction.type === "given" ? "default" : "outline"}
                        onClick={() => setNewTransaction({ ...newTransaction, type: "given" })}
                        className="flex-1"
                      >
                        দিলাম
                      </Button>
                      <Button
                        type="button"
                        variant={newTransaction.type === "received" ? "default" : "outline"}
                        onClick={() => setNewTransaction({ ...newTransaction, type: "received" })}
                        className="flex-1"
                      >
                        পেলাম
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">টাকার পরিমাণ</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">নোট</Label>
                    <Input
                      id="note"
                      value={newTransaction.note}
                      onChange={(e) => setNewTransaction({ ...newTransaction, note: e.target.value })}
                      placeholder="লেনদেনের বিবরণ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">তারিখ</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      যোগ করুন
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      বাতিল
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Customer Information */}
        {(customer.address || customer.description) && (
          <Card>
            <CardHeader>
              <CardTitle>গ্রাহকের তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.address && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">ঠিকানা:</span>
                  </div>
                  <p className="text-muted-foreground pl-6">{customer.address}</p>
                </div>
              )}
              {customer.description && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">বিবরণ:</span>
                  </div>
                  <p className="text-muted-foreground pl-6">{customer.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>বর্তমান ব্যালেন্স</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {customer.due_amount > 0 ? (
                  <span className="text-destructive">
                    বাকি: {formatAmount(customer.due_amount)}
                  </span>
                ) : customer.due_amount < 0 ? (
                  <span className="text-secondary">
                    দিতে হবে: {formatAmount(customer.due_amount)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">সমান</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                সর্বশেষ আপডেট: {formatDate(customer.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>লেনদেনের ইতিহাস</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>কোনো লেনদেন নেই</p>
                <p className="text-sm">নতুন লেনদেন যোগ করুন</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === "received" 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      }`}>
                        {transaction.type === "received" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === "received" ? "পেলাম" : "দিলাম"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.note || "কোনো নোট নেই"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === "received" ? "text-success" : "text-warning"
                      }`}>
                        {transaction.type === "received" ? "+" : "-"}{formatAmount(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Customer Dialog */}
      <CustomerForm
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        customer={customer}
        onSuccess={handleCustomerSuccess}
        mode="edit"
      />
    </div>
  );
};

export default CustomerDetail; 
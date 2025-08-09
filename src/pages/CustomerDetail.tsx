import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Phone, TrendingUp, TrendingDown, Send, Mail, MapPin, User, Edit, Trash2, Clock, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  useGetCustomerQuery, 
  useUpdateCustomerBalanceMutation
} from "@/store/api/customerApi";
import { 
  useGetCustomerTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation
} from "@/store/api/transactionApi";
import { 
  setCurrentCustomer, 
  updateCustomerBalance
} from "@/store/slices/customerSlice";
import { 
  addTransaction,
  updateTransaction,
  removeTransaction,
  setCurrentCustomerTransactions
} from "@/store/slices/transactionSlice";
import { triggerAnimation, setLoading, setShowSkeleton } from "@/store/slices/uiSlice";
import CustomerForm from "@/components/CustomerForm";
import TransactionForm from "@/components/TransactionForm";
import { CustomerDetailSkeleton } from "@/components/common/Skeleton";
import { AnimatedCard, FadeIn, SlideIn } from "@/components/AnimatedCard";
import { formatCurrency, formatTime, formatDueDate, getInitials, formatDate } from "@/utils/formatters";
import { TransactionItem, StatCard } from "@/components/common";
import { Transaction, Customer, SortOption } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const dispatch = useAppDispatch();
  
  // Local state
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  // RTK Query hooks
  const { data: customer, isLoading: customerLoading, error: customerError } = useGetCustomerQuery(id!, { skip: !id });
  const { data: transactions, isLoading: transactionLoading, error: transactionError, refetch: refetchTransactions } = useGetCustomerTransactionsQuery(id!, { skip: !id });

  // Mutations
  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransactionMutation] = useUpdateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [updateCustomerBalanceMutation] = useUpdateCustomerBalanceMutation();

  // Update Redux state when data changes
  useEffect(() => {
    if (customer) {
      dispatch(setCurrentCustomer(customer));
      dispatch(triggerAnimation('customer-loaded'));
    }
  }, [customer, dispatch]);

  useEffect(() => {
    if (transactions) {
      dispatch(setCurrentCustomerTransactions(transactions));
      dispatch(triggerAnimation('transactions-loaded'));
    }
  }, [transactions, dispatch]);

  // Sort and filter transactions
  useEffect(() => {
    if (!transactions) return;
    
    const sorted = [...transactions];
    
    switch (sortBy) {
      case "date-desc":
        sorted.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
        break;
      case "date-asc":
        sorted.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        break;
      case "amount-desc":
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-asc":
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      case "received":
        sorted.sort((a, b) => {
          if (a.type === "received" && b.type !== "received") return -1;
          if (a.type !== "received" && b.type === "received") return 1;
          return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
        });
        break;
      case "given":
        sorted.sort((a, b) => {
          if (a.type === "given" && b.type !== "given") return -1;
          if (a.type !== "given" && b.type === "given") return 1;
          return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
        });
        break;
    }
    
    setFilteredTransactions(sorted);
  }, [transactions, sortBy]);

  // Calculate totals
  const totalReceived = transactions
    ?.filter(t => t.type === "received")
    .reduce((sum, t) => sum + t.amount - (t.refund_amount || 0), 0) || 0;

  const totalGiven = transactions
    ?.filter(t => t.type === "given")
    .reduce((sum, t) => sum + t.amount - (t.refund_amount || 0), 0) || 0;

  const calculatedNetReceivable = totalGiven - totalReceived;

  const handleCustomerSuccess = () => {
    setShowEditDialog(false);
    dispatch(triggerAnimation('customer-updated'));
  };

  const handleTransactionSuccess = async () => {
    setShowAddDialog(false);
    setShowEditTransactionDialog(false);
    setSelectedTransaction(null);
    dispatch(triggerAnimation('transaction-added'));
    
    // Refetch the transaction data to show real-time updates
    await refetchTransactions();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditTransactionDialog(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("আপনি কি এই লেনদেন মুছে ফেলতে চান?")) {
      return;
    }

    try {
      await deleteTransaction({ id: transactionId, customerId: id! });
      dispatch(removeTransaction(transactionId));
      dispatch(triggerAnimation('transaction-deleted'));
      
      // Let the database trigger handle balance calculation
      // Fetch updated customer data to get the new balance
      const { data: updatedCustomer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id!)
        .single();

      if (customerError) {
        console.error('Error fetching updated customer:', customerError);
        throw new Error('গ্রাহকের তথ্য আপডেট করতে সমস্যা হয়েছে');
      }

      // The database trigger will handle balance calculation automatically
      // No need to manually update Redux store here
      
      toast({
        title: "সফল!",
        description: "লেনদেন মুছে ফেলা হয়েছে।",
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "লেনদেন মুছে ফেলতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
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

  // Loading states
  if (authLoading || customerLoading || transactionLoading) {
    return <CustomerDetailSkeleton />;
  }

  if (!customer) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">গ্রাহক পাওয়া যায়নি</h2>
          <Button onClick={() => navigate("/customers")}>
            গ্রাহক তালিকায় ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <FadeIn>
        {/* Header */}
        <SlideIn direction="up" delay={0.1}>
          <div className="flex items-center justify-between">
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
              </Dialog>
            </div>
          </div>
        </SlideIn>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {customer.due_amount > 0 ? (
                    <span className="text-success">
                     নেট পাওনা: {formatCurrency(customer.due_amount)}
                    </span>
                  ) : customer.due_amount < 0 ? (
                    <span className="text-destructive">
                      নেট দেনা: {formatCurrency(Math.abs(customer.due_amount))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">সমান</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">বর্তমান ব্যালেন্স (ডাটাবেস)</p>
                {Math.abs(customer.due_amount - calculatedNetReceivable) > 0.01 && (
                  <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-700 dark:text-orange-300 font-medium mb-1">
                      ⚠️ ব্যালেন্স মিলছে না
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      গণনা: {formatCurrency(calculatedNetReceivable)}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      ডাটাবেস: {formatCurrency(customer.due_amount)}
                    </p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2 text-success">
                  {formatCurrency(totalReceived)}
                </div>
                <p className="text-sm text-muted-foreground">মোট পেলাম (নেট)</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2 text-warning">
                  {formatCurrency(totalGiven)}
                </div>
                <p className="text-sm text-muted-foreground">মোট দিলাম (নেট)</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                সর্বশেষ আপডেট: {formatDate(customer.updated_at, { showTime: true })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>লেনদেনের ইতিহাস</CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">নতুন থেকে পুরাতন</SelectItem>
                    <SelectItem value="date-asc">পুরাতন থেকে নতুন</SelectItem>
                    <SelectItem value="amount-desc">বড় থেকে ছোট</SelectItem>
                    <SelectItem value="amount-asc">ছোট থেকে বড়</SelectItem>
                    <SelectItem value="received">শুধু পেলাম</SelectItem>
                    <SelectItem value="given">শুধু দিলাম</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>কোনো লেনদেন নেই</p>
                <p className="text-sm">নতুন লেনদেন যোগ করুন</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          transaction.type === "received" 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        }`}>
                          {transaction.type === "received" ? (
                            <TrendingUp className="h-6 w-6" />
                          ) : (
                            <TrendingDown className="h-6 w-6" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {transaction.type === "received" ? "পেলাম" : "দিলাম"}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {transaction.note || "কোনো নোট নেই"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(transaction.date, transaction.time)}
                            {transaction.due_date && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-orange-600">
                                  পরিশোধের তারিখ: {new Date(transaction.due_date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-lg ${
                            transaction.type === "received" ? "text-success" : "text-warning"
                          }`}>
                            {transaction.type === "received" ? "+" : "-"}{formatCurrency(transaction.amount)}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              className="h-8 w-8 p-0 hover:bg-accent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Edit Customer Dialog */}
      <CustomerForm
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        customer={customer}
        onSuccess={handleCustomerSuccess}
        mode="edit"
      />

      {/* Add Transaction Dialog */}
      <TransactionForm
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        customer={customer}
        onSuccess={handleTransactionSuccess}
        mode="add"
      />

      {/* Edit Transaction Dialog */}
      {selectedTransaction && (
        <TransactionForm
          isOpen={showEditTransactionDialog}
          onClose={() => {
            setShowEditTransactionDialog(false);
            setSelectedTransaction(null);
          }}
          customer={customer}
          onSuccess={handleTransactionSuccess}
          mode="edit"
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
};

export default CustomerDetail;
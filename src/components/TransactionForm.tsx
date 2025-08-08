import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, AlertCircle, Clock, RefreshCw, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  due_amount: number;
}

interface Transaction {
  id: string;
  type: "given" | "received";
  amount: number;
  note: string;
  date: string;
  time: string;
  refund_amount: number;
  refund_note: string | null;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  transaction?: Transaction;
}

interface TransactionData {
  type: "given" | "received";
  amount: string;
  note: string;
  date: string;
  time: string;
  due_date: string;
  reminder_type: "email" | "sms" | "both";
  send_reminder: boolean;
  refund_amount: string;
  refund_note: string;
}

const TransactionForm = ({ isOpen, onClose, customer, onSuccess, mode, transaction }: TransactionFormProps) => {
  const [formData, setFormData] = useState<TransactionData>({
    type: transaction?.type || "given",
    amount: transaction?.amount?.toString() || "",
    note: transaction?.note || "",
    date: transaction?.date || new Date().toISOString().split('T')[0],
    time: transaction?.time || new Date().toTimeString().slice(0, 5),
    due_date: transaction?.due_date || "",
    reminder_type: transaction?.reminder_type || "email",
    send_reminder: transaction?.send_reminder ?? false,
    refund_amount: transaction?.refund_amount?.toString() || "",
    refund_note: transaction?.refund_note || "",
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof TransactionData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const calculateNewBalance = () => {
    const currentAmount = parseFloat(formData.amount) || 0;
    const refundAmount = parseFloat(formData.refund_amount) || 0;
    const currentDue = customer.due_amount || 0;
    
    if (formData.type === "given") {
      return currentDue + currentAmount - refundAmount;
    } else {
      return currentDue - currentAmount + refundAmount;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Form submitted - starting transaction creation');
      console.log('Customer data:', customer);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("সঠিক পরিমাণ লিখুন");
      }

      const refundAmount = parseFloat(formData.refund_amount) || 0;
      if (refundAmount > amount) {
        throw new Error("ফেরতের পরিমাণ মূল পরিমাণের চেয়ে বেশি হতে পারে না");
      }

      const transactionData = {
        user_id: user.id,
        customer_id: customer.id,
        type: formData.type,
        amount: amount,
        note: formData.note,
        date: formData.date,
        time: formData.time,
        due_date: formData.due_date || null,
        reminder_type: formData.send_reminder ? formData.reminder_type : null,
        refund_amount: refundAmount,
        refund_note: formData.refund_note || null,
      };

      console.log('Transaction data prepared:', transactionData);

      if (mode === 'add') {
        console.log('Inserting transaction into database...');
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;
        console.log('Transaction inserted successfully');

        // Send email notification if customer has email
        if (customer.email) {
          console.log('Customer has email, sending notification to:', customer.email);
          await sendTransactionEmail(customer, transactionData);
        } else {
          console.log('Email not sent. Customer email:', customer.email);
        }

        toast({
          title: "সফল!",
          description: "লেনদেন যোগ করা হয়েছে।",
        });
      } else {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction?.id);

        if (error) throw error;

        toast({
          title: "সফল!",
          description: "লেনদেন আপডেট হয়েছে।",
        });
      }

      onSuccess();
      onClose();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "ত্রুটি",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const sendTransactionEmail = async (customer: Customer, transaction: typeof transactionData) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const businessName = profile?.business_name || 'TallyKhata Business';
      const currentBalance = customer.due_amount || 0;
      const transactionAmount = transaction.amount;
      const refundAmount = transaction.refund_amount || 0;
      const netAmount = transactionAmount - refundAmount;
      const newBalance = transaction.type === 'given' 
        ? currentBalance + netAmount 
        : currentBalance - netAmount;

      const response = await supabase.functions.invoke('send-transaction-email', {
        body: {
          customerEmail: customer.email,
          customerName: customer.name,
          transactionType: transaction.type,
          amount: transactionAmount,
          refundAmount: refundAmount,
          netAmount: netAmount,
          previousBalance: currentBalance,
          newBalance: newBalance,
          note: transaction.note,
          refundNote: transaction.refund_note,
          businessName: businessName
        }
      });

      if (response.error) {
        console.error('Error sending email:', response.error);
      } else {
        console.log('Transaction email sent successfully');
      }
    } catch (error) {
      console.error('Failed to send transaction email:', error);
    }
  };

  const getTransactionMessage = () => {
    const amount = parseFloat(formData.amount) || 0;
    const refundAmount = parseFloat(formData.refund_amount) || 0;
    const netAmount = amount - refundAmount;
    
    if (formData.type === "given") {
      return `${customer.name} কে ${formatAmount(netAmount)} দেওয়া হয়েছে`;
    } else {
      return `${customer.name} থেকে ${formatAmount(netAmount)} পাওয়া হয়েছে`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'add' ? 'নতুন লেনদেন যোগ করুন' : 'লেনদেন সম্পাদনা করুন'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {customer.name} - {mode === 'add' ? 'নতুন লেনদেন' : 'লেনদেন আপডেট'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                লেনদেনের ধরন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={formData.type === "given" ? "default" : "outline"}
                  onClick={() => handleInputChange('type', 'given')}
                  className="h-16 flex flex-col gap-2"
                >
                  <TrendingDown className="h-6 w-6" />
                  <span>দেওয়া হয়েছে</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.type === "received" ? "default" : "outline"}
                  onClick={() => handleInputChange('type', 'received')}
                  className="h-16 flex flex-col gap-2"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>পাওয়া হয়েছে</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                লেনদেনের বিবরণ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-medium">পরিমাণ *</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="০"
                    className="text-lg h-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ৳
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-base font-medium">তারিখ *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-base font-medium">সময় *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note" className="text-base font-medium">বিবরণ</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="লেনদেনের বিবরণ লিখুন (ঐচ্ছিক)"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Debt Reminder Section - Only for "given" transactions */}
          {formData.type === "given" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  ঋণ স্মরণিকা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-base font-medium">পরিশোধের তারিখ</Label>
                  <div className="relative">
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                      min={formData.date}
                      className="h-12 cursor-pointer"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">স্মরণিকা পাঠানো</Label>
                    <p className="text-sm text-muted-foreground">
                      পরিশোধের তারিখের আগে স্মরণিকা পাঠানো হবে
                    </p>
                  </div>
                  <Switch
                    checked={formData.send_reminder}
                    onCheckedChange={(checked) => handleInputChange('send_reminder', checked)}
                  />
                </div>

                {formData.send_reminder && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">স্মরণিকার ধরন</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={formData.reminder_type === "email" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('reminder_type', 'email')}
                        className="h-10"
                      >
                        ইমেইল
                      </Button>
                      <Button
                        type="button"
                        variant={formData.reminder_type === "sms" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('reminder_type', 'sms')}
                        className="h-10"
                      >
                        এসএমএস
                      </Button>
                      <Button
                        type="button"
                        variant={formData.reminder_type === "both" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('reminder_type', 'both')}
                        className="h-10"
                      >
                        উভয়
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 h-12 text-base">
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {mode === 'add' ? 'লেনদেন যোগ করুন' : 'আপডেট করুন'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="h-12 px-6">
              বাতিল
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm; 
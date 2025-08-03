import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  transaction?: any;
}

interface TransactionData {
  type: "given" | "received";
  amount: string;
  note: string;
  date: string;
  due_date: string;
  reminder_type: "email" | "sms" | "both";
  send_reminder: boolean;
}

const TransactionForm = ({ isOpen, onClose, customer, onSuccess, mode, transaction }: TransactionFormProps) => {
  const [formData, setFormData] = useState<TransactionData>({
    type: transaction?.type || "given",
    amount: transaction?.amount?.toString() || "",
    note: transaction?.note || "",
    date: transaction?.date || new Date().toISOString().split('T')[0],
    due_date: transaction?.due_date || "",
    reminder_type: transaction?.reminder_type || "email",
    send_reminder: transaction?.send_reminder ?? false,
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
    const currentDue = customer.due_amount || 0;
    
    if (formData.type === "given") {
      return currentDue + currentAmount;
    } else {
      return currentDue - currentAmount;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("সঠিক পরিমাণ লিখুন");
      }

      const transactionData = {
        user_id: user.id,
        customer_id: customer.id,
        type: formData.type,
        amount: amount,
        note: formData.note,
        date: formData.date,
        due_date: formData.due_date || null,
        reminder_type: formData.send_reminder ? formData.reminder_type : null,
      };

      if (mode === 'add') {
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;

        // Send email notification if enabled
        if (customer.send_email_notifications && customer.email) {
          await sendTransactionEmail(customer, transactionData);
        }

        toast({
          title: "সফল!",
          description: "লেনদেন যোগ করা হয়েছে।",
        });
      } else {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);

        if (error) throw error;

        toast({
          title: "সফল!",
          description: "লেনদেন আপডেট হয়েছে।",
        });
      }

      onSuccess();
      onClose();
      
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const sendTransactionEmail = async (customer: any, transaction: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const businessName = profile?.business_name || 'TallyKhata Business';
      const currentBalance = customer.due_amount || 0;
      const transactionAmount = transaction.amount;
      const newBalance = transaction.type === 'given' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;

      const response = await supabase.functions.invoke('send-transaction-email', {
        body: {
          customerEmail: customer.email,
          customerName: customer.name,
          transactionType: transaction.type,
          amount: transactionAmount,
          previousBalance: currentBalance,
          newBalance: newBalance,
          note: transaction.note,
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
    if (formData.type === "given") {
      return `${customer.name} কে ${formatAmount(amount)} দেওয়া হয়েছে`;
    } else {
      return `${customer.name} থেকে ${formatAmount(amount)} পাওয়া হয়েছে`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'নতুন লেনদেন' : 'লেনদেন সম্পাদনা'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>লেনদেনের ধরন</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "given" ? "default" : "outline"}
                onClick={() => handleInputChange('type', 'given')}
                className="flex-1"
              >
                দেওয়া হয়েছে
              </Button>
              <Button
                type="button"
                variant={formData.type === "received" ? "default" : "outline"}
                onClick={() => handleInputChange('type', 'received')}
                className="flex-1"
              >
                পাওয়া হয়েছে
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">পরিমাণ *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="০"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">তারিখ *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">বিবরণ</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder="লেনদেনের বিবরণ লিখুন"
              rows={2}
            />
          </div>

          {/* Debt Reminder Section - Only for "given" transactions */}
          {formData.type === "given" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  ঋণ স্মরণিকা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">পরিশোধের তারিখ</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    min={formData.date}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>স্মরণিকা পাঠানো</Label>
                    <p className="text-xs text-muted-foreground">
                      পরিশোধের তারিখের আগে স্মরণিকা পাঠানো হবে
                    </p>
                  </div>
                  <Switch
                    checked={formData.send_reminder}
                    onCheckedChange={(checked) => handleInputChange('send_reminder', checked)}
                  />
                </div>

                {formData.send_reminder && (
                  <div className="space-y-2">
                    <Label>স্মরণিকার ধরন</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.reminder_type === "email" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('reminder_type', 'email')}
                      >
                        ইমেইল
                      </Button>
                      <Button
                        type="button"
                        variant={formData.reminder_type === "sms" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('reminder_type', 'sms')}
                      >
                        এসএমএস
                      </Button>
                      <Button
                        type="button"
                        variant={formData.reminder_type === "both" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('reminder_type', 'both')}
                      >
                        উভয়
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Balance Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">হিসাবের সারসংক্ষেপ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>বর্তমান বাকি:</span>
                <Badge variant={customer.due_amount > 0 ? "destructive" : "default"}>
                  {formatAmount(customer.due_amount || 0)}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>এই লেনদেন:</span>
                <Badge variant={formData.type === "given" ? "destructive" : "default"}>
                  {formData.type === "given" ? "+" : "-"} {formatAmount(parseFloat(formData.amount) || 0)}
                </Badge>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>নতুন বাকি:</span>
                  <Badge variant={calculateNewBalance() > 0 ? "destructive" : "default"}>
                    {formatAmount(calculateNewBalance())}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'add' ? 'যোগ করুন' : 'আপডেট করুন'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              বাতিল
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm; 
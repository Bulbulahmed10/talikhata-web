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
import { transactionsApi } from "@/lib/api";
import { Customer, Transaction } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { useAppDispatch } from "@/store/hooks";
import { addTransaction, updateTransaction, removeTransaction } from "@/store/slices/transactionSlice";
import { updateCustomerBalance } from "@/store/slices/customerSlice";

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
    refund_amount: transaction?.refund_amount?.toString() || "",
    refund_note: transaction?.refund_note || "",
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const handleInputChange = (field: keyof TransactionData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Using imported formatCurrency instead of local formatAmount



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Form submitted - starting transaction creation');
      console.log('Customer data:', customer);
      
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("সঠিক পরিমাণ লিখুন");
      }

      const refundAmount = parseFloat(formData.refund_amount) || 0;
      if (refundAmount > amount) {
        throw new Error("ফেরতের পরিমাণ মূল পরিমাণের চেয়ে বেশি হতে পারে না");
      }

      const transactionData = {
        customer_id: customer.id,
        type: formData.type,
        amount: amount,
        note: formData.note,
        date: formData.date,
        time: formData.time,
        due_date: formData.due_date || null,
        reminder_type: formData.reminder_type,
        refund_amount: refundAmount,
        refund_note: formData.refund_note || null,
      };

      console.log('Transaction data prepared:', transactionData);

      if (mode === 'add') {
        await transactionsApi.create({
          customer: transactionData.customer_id,
          type: transactionData.type,
          amount: transactionData.amount,
          refund_amount: transactionData.refund_amount,
          note: transactionData.note || undefined,
          date: transactionData.date,
          time: transactionData.time,
          due_date: transactionData.due_date || undefined,
        });

        toast({
          title: "সফল!",
          description: "লেনদেন যোগ করা হয়েছে।",
        });
      } else {
        // For edit mode, let the database trigger handle balance calculation
        // Update the current transaction
        await transactionsApi.update(transaction!.id, {
          type: transactionData.type,
          amount: transactionData.amount,
          refund_amount: transactionData.refund_amount,
          note: transactionData.note || undefined,
          date: transactionData.date,
          time: transactionData.time,
          due_date: transactionData.due_date || undefined,
        });

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

  interface TransactionEmailData {
    amount: number;
    refund_amount: number;
    type: "given" | "received";
    note: string;
    refund_note: string | null;
  }

  const sendTransactionEmail = async (_customer: Customer, _transaction: TransactionEmailData) => {
    // Email sending moved out; not implemented for backend version yet
  };

  const getTransactionMessage = () => {
    const amount = parseFloat(formData.amount) || 0;
    const refundAmount = parseFloat(formData.refund_amount) || 0;
    const netAmount = amount - refundAmount;
    
    if (formData.type === "given") {
      return `${customer.name} কে ${formatCurrency(netAmount)} দেওয়া হয়েছে`;
    } else {
      return `${customer.name} থেকে ${formatCurrency(netAmount)} পাওয়া হয়েছে`;
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
                      className="h-12 cursor-pointer w-full"
                      placeholder="DD/MM/YYYY"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    দিন/মাস/বছর ফরম্যাটে তারিখ নির্বাচন করুন
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">স্মরণিকা পাঠান</Label>
                    <p className="text-sm text-muted-foreground">ঋণ পরিশোধের স্মরণিকা পাঠানো হবে</p>
                  </div>
                  <Switch
                    checked={formData.type === "given" && formData.due_date !== ""}
                    onCheckedChange={(checked) => {
                      // This is now controlled by the transaction type and due date
                    }}
                    disabled={formData.type !== "given" || formData.due_date === ""}
                  />
                </div>

                {formData.type === "given" && formData.due_date !== "" && (
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
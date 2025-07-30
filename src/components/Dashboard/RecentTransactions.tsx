import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useNavigate } from "react-router-dom";

const RecentTransactions = () => {
  const { transactions, loading } = useTransactions();
  const navigate = useNavigate();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">সাম্প্রতিক লেনদেন</CardTitle>
        <Button size="sm" className="gap-1" onClick={() => navigate("/customers")}>
          <Plus className="h-4 w-4" />
          নতুন
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>কোনো লেনদেন নেই</p>
            <p className="text-sm">নতুন লেনদেন যোগ করুন</p>
          </div>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/customers/${transaction.customer_id}`)}
            >
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
                  <p className="font-medium text-foreground">{transaction.customers.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.note || 'কোনো নোট নেই'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === "received" ? "text-success" : "text-warning"
                }`}>
                  {transaction.type === "received" ? "+" : "-"}{formatAmount(transaction.amount)}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
              </div>
            </div>
          ))
        )}
        <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/reports")}>
          সকল লেনদেন দেখুন
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
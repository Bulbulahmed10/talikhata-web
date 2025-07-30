import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";

interface Transaction {
  id: string;
  customerName: string;
  type: "given" | "received";
  amount: number;
  note: string;
  date: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    customerName: "আবুল হোসেন",
    type: "received",
    amount: 1500,
    note: "চাল বিক্রি",
    date: "২৩ ডিসেম্বর"
  },
  {
    id: "2", 
    customerName: "ফাতেমা খাতুন",
    type: "given",
    amount: 800,
    note: "ডাল কিনেছেন",
    date: "২২ ডিসেম্বর"
  },
  {
    id: "3",
    customerName: "করিম মিয়া",
    type: "received", 
    amount: 2000,
    note: "তেল বিক্রি",
    date: "২১ ডিসেম্বর"
  }
];

const RecentTransactions = () => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">সাম্প্রতিক লেনদেন</CardTitle>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          নতুন
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
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
                <p className="font-medium text-foreground">{transaction.customerName}</p>
                <p className="text-sm text-muted-foreground">{transaction.note}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === "received" ? "text-success" : "text-warning"
              }`}>
                {transaction.type === "received" ? "+" : "-"}{formatAmount(transaction.amount)}
              </p>
              <p className="text-xs text-muted-foreground">{transaction.date}</p>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full mt-4">
          সকল লেনদেন দেখুন
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
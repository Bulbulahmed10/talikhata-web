import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Phone } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  dueAmount: number;
  lastTransaction: string;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "আবুল হোসেন",
    phone: "০১৭১২৩৪৫৬৭৮",
    dueAmount: 1500,
    lastTransaction: "২ দিন আগে"
  },
  {
    id: "2",
    name: "ফাতেমা খাতুন", 
    phone: "০১৮১২৩৪৫৬৭৮",
    dueAmount: -800,
    lastTransaction: "৫ দিন আগে"
  },
  {
    id: "3",
    name: "করিম মিয়া",
    phone: "০১৯১২৩৪৫৬৭৮", 
    dueAmount: 2000,
    lastTransaction: "১ সপ্তাহ আগে"
  },
  {
    id: "4",
    name: "রাশেদা বেগম",
    phone: "০১৬১২৩৪৫৬৭৮",
    dueAmount: 0,
    lastTransaction: "৩ দিন আগে"
  }
];

const CustomersList = () => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">গ্রাহক তালিকা</CardTitle>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          নতুন গ্রাহক
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockCustomers.map((customer) => (
          <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{customer.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </div>
                <p className="text-xs text-muted-foreground">{customer.lastTransaction}</p>
              </div>
            </div>
            <div className="text-right">
              {customer.dueAmount > 0 ? (
                <Badge variant="destructive" className="mb-1">
                  বাকি: {formatAmount(customer.dueAmount)}
                </Badge>
              ) : customer.dueAmount < 0 ? (
                <Badge variant="secondary" className="mb-1">
                  দিতে হবে: {formatAmount(customer.dueAmount)}
                </Badge>
              ) : (
                <Badge variant="outline" className="mb-1">
                  সমান
                </Badge>
              )}
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full mt-4">
          সকল গ্রাহক দেখুন
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomersList;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Phone, Loader2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useNavigate } from "react-router-dom";

const CustomersList = () => {
  const { customers, loading } = useCustomers();
  const navigate = useNavigate();

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

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'আজ';
    if (days === 1) return '১ দিন আগে';
    if (days < 7) return `${days} দিন আগে`;
    const weeks = Math.floor(days / 7);
    return `${weeks} সপ্তাহ আগে`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">গ্রাহক তালিকা</CardTitle>
        <Button size="sm" className="gap-1" onClick={() => navigate("/customers")}>
          <Plus className="h-4 w-4" />
          নতুন গ্রাহক
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>কোনো গ্রাহক নেই</p>
            <p className="text-sm">নতুন গ্রাহক যোগ করুন</p>
          </div>
        ) : (
          customers.slice(0, 5).map((customer) => (
            <div 
              key={customer.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={customer.photo_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{getRelativeTime(customer.updated_at)}</p>
                </div>
              </div>
              <div className="text-right">
                {customer.due_amount > 0 ? (
                  <Badge variant="destructive" className="mb-1">
                    বাকি: {formatAmount(customer.due_amount)}
                  </Badge>
                ) : customer.due_amount < 0 ? (
                  <Badge variant="secondary" className="mb-1">
                    দিতে হবে: {formatAmount(customer.due_amount)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mb-1">
                    সমান
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
        <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/customers")}>
          সকল গ্রাহক দেখুন
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomersList;
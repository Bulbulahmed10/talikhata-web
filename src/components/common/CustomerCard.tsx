import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Eye, Edit, Trash2 } from "lucide-react";
import { Customer } from "@/types";
import { formatCurrency, getInitials, formatPhoneNumber } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface CustomerCardProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
  className?: string;
  showActions?: boolean;
}

const CustomerCard = ({ 
  customer, 
  onView, 
  onEdit, 
  onDelete,
  className,
  showActions = true 
}: CustomerCardProps) => {
  const isDebt = customer.due_amount > 0;
  const isCredit = customer.due_amount < 0;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md cursor-pointer",
      isDebt && "border-l-4 border-l-red-500",
      isCredit && "border-l-4 border-l-green-500",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={customer.photo_url || undefined} alt={customer.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">{customer.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {formatPhoneNumber(customer.phone)}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(customer);
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(customer);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(customer.id);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={isDebt ? "destructive" : isCredit ? "default" : "secondary"}>
              {isDebt ? "দেনা" : isCredit ? "পাওনা" : "শূন্য"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(Math.abs(customer.due_amount))}
            </span>
          </div>
        </div>
        
        {customer.address && (
          <div className="flex items-start gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{customer.address}</span>
          </div>
        )}
        
        {customer.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {customer.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;

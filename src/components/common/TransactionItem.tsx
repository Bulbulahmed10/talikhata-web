import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, Calendar } from "lucide-react";
import { Transaction } from "@/types";
import { formatCurrency, formatTime, formatDueDate } from "@/utils/formatters";
import { TRANSACTION_TYPES } from "@/constants";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  className?: string;
}

const TransactionItem = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  className 
}: TransactionItemProps) => {
  const isGiven = transaction.type === TRANSACTION_TYPES.GIVEN;
  const hasRefund = transaction.refund_amount > 0;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md border-l-4",
      isGiven 
        ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/20" 
        : "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isGiven ? "destructive" : "default"}>
                {isGiven ? "দিলাম" : "পেলাম"}
              </Badge>
              {hasRefund && (
                <Badge variant="secondary" className="text-xs">
                  ফেরত: {formatCurrency(transaction.refund_amount)}
                </Badge>
              )}
            </div>
            
            <div className="text-lg font-semibold mb-1">
              {formatCurrency(transaction.amount)}
            </div>
            
            {transaction.note && (
              <p className="text-sm text-muted-foreground mb-2">
                {transaction.note}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatTime(transaction.date, transaction.time)}
              </div>
              
              {transaction.due_date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Due: {formatDueDate(transaction.due_date)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(transaction)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(transaction.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionItem;

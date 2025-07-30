import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  subtitle?: string;
}

const StatsCard = ({ title, amount, icon, variant = "default", subtitle }: StatsCardProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const variantClasses = {
    default: "border-border",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5", 
    destructive: "border-destructive/20 bg-destructive/5",
  };

  const iconClasses = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", variantClasses[variant])}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {formatAmount(amount)}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-full bg-background border flex items-center justify-center", iconClasses[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
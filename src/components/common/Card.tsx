import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "bordered" | "elevated";
}

export const Card = ({
  children,
  title,
  subtitle,
  className,
  headerClassName,
  contentClassName,
  variant = "default",
}: CardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "bordered":
        return "border-2 border-border";
      case "elevated":
        return "shadow-lg";
      default:
        return "";
    }
  };

  return (
    <UICard className={cn(getVariantClasses(), className)}>
      {(title || subtitle) && (
        <CardHeader className={cn("pb-3", headerClassName)}>
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>
    </UICard>
  );
};

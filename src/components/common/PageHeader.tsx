import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  backUrl?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  backButton = false,
  backUrl,
  actions,
  className,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div className="flex items-center gap-4">
        {backButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            ফিরে যান
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

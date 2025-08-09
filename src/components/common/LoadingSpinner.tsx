import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  variant?: "default" | "primary" | "secondary";
}

const LoadingSpinner = ({ 
  size = "md", 
  className, 
  text,
  variant = "default" 
}: LoadingSpinnerProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-8 w-8";
      default:
        return "h-6 w-6";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Loader2 className={cn(getSizeClasses(), getVariantClasses())} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;

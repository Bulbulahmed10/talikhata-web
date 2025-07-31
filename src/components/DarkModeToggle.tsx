import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface DarkModeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DarkModeToggle = ({ 
  variant = "ghost", 
  size = "sm", 
  className = "" 
}: DarkModeToggleProps) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleDarkMode}
      className={className}
      title={isDarkMode ? "লাইট মোডে যান" : "ডার্ক মোডে যান"}
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};

export default DarkModeToggle; 
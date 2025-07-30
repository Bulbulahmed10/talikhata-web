import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, Settings } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">ত</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">তালিখাতা</h1>
              <p className="text-xs text-muted-foreground">রহিম জেনারেল স্টোর</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">র</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
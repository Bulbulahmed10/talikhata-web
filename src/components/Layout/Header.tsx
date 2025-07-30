import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, LogOut, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface Profile {
  business_name: string;
  plan: string;
}

const Header = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('business_name, plan')
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "লগআউট ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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
              <p className="text-xs text-muted-foreground">
                {profile?.business_name || 'আমার দোকান'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Button 
            variant={isActive("/") ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigate("/")}
          >
            ড্যাশবোর্ড
          </Button>
          <Button 
            variant={isActive("/customers") ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigate("/customers")}
            className="gap-1"
          >
            <Users className="h-4 w-4" />
            গ্রাহক
          </Button>
          <Button 
            variant={isActive("/reports") ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigate("/reports")}
            className="gap-1"
          >
            <FileText className="h-4 w-4" />
            রিপোর্ট
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.business_name ? getInitials(profile.business_name) : 'র'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
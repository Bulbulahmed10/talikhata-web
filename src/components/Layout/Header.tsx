import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, LogOut, Users, FileText, Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import PWAInstallButton from "@/components/PWAInstallButton";
import DarkModeToggle from "@/components/DarkModeToggle";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  business_name: string;
  plan: string;
  full_name?: string;
  profile_picture_url?: string;
}

const Header = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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

  const handleProfileSuccess = () => {
    // Refresh profile data
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
          {/* PWA Install Button */}
          <PWAInstallButton 
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            showText={true}
            showInstalledStatus={true}
          />
          
          {/* Dark Mode Toggle */}
          <DarkModeToggle />
          
          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* User Profile */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowUserProfile(true)}
            className="flex items-center gap-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.profile_picture_url || undefined} />
              <AvatarFallback className="text-xs">
                {profile?.profile_picture_url ? 
                  <User className="h-3 w-3" /> : 
                  getInitials(profile?.full_name || user?.email || 'র')
                }
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm">
              {profile?.full_name || user?.email?.split('@')[0] || 'ব্যবহারকারী'}
            </span>
          </Button>
          
          {/* Logout */}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* User Profile Dialog */}
      {user && profile && (
        <UserProfile
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={user}
          profile={profile}
          onSuccess={handleProfileSuccess}
        />
      )}
    </header>
  );
};

export default Header;
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, LogOut, Users, FileText, Settings, User, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import DarkModeToggle from "@/components/DarkModeToggle";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";

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
      if (!user) return;
      try {
        const res = await authApi.profile();
        setProfile({
          business_name: res.user.name || res.user.email.split('@')[0],
          plan: 'free',
          full_name: res.user.name,
          profile_picture_url: undefined,
        });
      } catch {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user]);

  const { logout } = useAuth();
  const handleLogout = async () => {
    logout();
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleProfileSuccess = () => {
    // Rehydrate profile
    if (!user) return;
    authApi.profile().then((res) => setProfile({
      business_name: res.user.name || res.user.email.split('@')[0],
      plan: 'free',
      full_name: res.user.name,
      profile_picture_url: undefined,
    })).catch(() => setProfile(null));
  };

  return (
    <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-primary-foreground">ত</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">তালিখাতা</h1>
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
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              ড্যাশবোর্ড
            </Button>
            <Button 
              variant={isActive("/customers") ? "default" : "ghost"} 
              size="sm"
              onClick={() => navigate("/customers")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              গ্রাহক
            </Button>
            <Button 
              variant={isActive("/reports") ? "default" : "ghost"} 
              size="sm"
              onClick={() => navigate("/reports")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              রিপোর্ট
            </Button>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* User Profile */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowUserProfile(true)}
              className="flex items-center gap-2 hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.profile_picture_url || undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {profile?.profile_picture_url ? 
                    <User className="h-4 w-4" /> : 
                    getInitials(profile?.full_name || user?.email || 'র')
                  }
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {profile?.full_name || user?.email?.split('@')[0] || 'ব্যবহারকারী'}
              </span>
            </Button>
            
            {/* Logout */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Profile Dialog */}
      {user && (
        <UserProfile
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={{ id: user.id, email: user.email }}
          profile={profile as any}
          onSuccess={handleProfileSuccess}
        />
      )}
    </header>
  );
};

export default Header;
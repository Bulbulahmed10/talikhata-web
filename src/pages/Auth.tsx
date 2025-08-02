import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const { toast } = useToast();

  // Check if we're in password reset mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'reset') {
      setIsResetMode(true);
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            business_name: businessName,
            phone: phone,
          }
        }
      });

      if (error) {
        toast({
          title: "সাইন আপ ত্রুটি",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "সফল!",
          description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে। অনুগ্রহ করে আপনার ইমেইল যাচাই করুন।",
        });
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "লগিন ত্রুটি",
          description: "ইমেইল বা পাসওয়ার্ড ভুল।",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।",
      });
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না।",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "আপনার পাসওয়ার্ড আপডেট হয়েছে।",
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // If in reset mode, show password update form
  if (isResetMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Store className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">পাসওয়ার্ড পরিবর্তন</CardTitle>
            </div>
            <p className="text-muted-foreground">নতুন পাসওয়ার্ড সেট করুন</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                পাসওয়ার্ড আপডেট করুন
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Store className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">তালিখাতা</CardTitle>
          </div>
          <p className="text-muted-foreground">আপনার ব্যবসার হিসাব সহজভাবে</p>
        </CardHeader>
        <CardContent>
          {showPasswordReset ? (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowPasswordReset(false)}
                className="mb-4"
              >
                ← লগিনে ফিরে যান
              </Button>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">ইমেইল</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="আপনার ইমেইল ঠিকানা"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  পাসওয়ার্ড রিসেট লিংক পাঠান
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">লগিন</TabsTrigger>
                <TabsTrigger value="signup">নিবন্ধন</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">ইমেইল</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">পাসওয়ার্ড</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    লগিন করুন
                  </Button>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full"
                    onClick={() => setShowPasswordReset(true)}
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">দোকানের নাম</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">ফোন নম্বর</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="০১৭১২৩৪৫৬৭৮"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">ইমেইল</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">পাসওয়ার্ড</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    অ্যাকাউন্ট তৈরি করুন
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
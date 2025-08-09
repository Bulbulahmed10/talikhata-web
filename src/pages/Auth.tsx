import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
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

  const { login } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.register({ name: businessName || email.split('@')[0], email, password });
      await login(res.token);
      toast({ title: "সফল!", description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে।" });
    } catch (error) {
        toast({
          title: "সাইন আপ ত্রুটি",
          description: error instanceof Error ? error.message : "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          variant: "destructive",
        });
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      await login(res.token);
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Not implemented on backend yet; show info
      toast({
        title: "শীঘ্রই আসছে",
        description: "পাসওয়ার্ড রিসেট ইমেইল ব্যাকএন্ডে শীঘ্রই যুক্ত হবে।",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।";
      toast({
        title: "ত্রুটি",
        description: errorMessage,
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
      await authApi.changePassword({ currentPassword: '', newPassword });
      toast({
        title: "সফল!",
        description: "আপনার পাসওয়ার্ড আপডেট হয়েছে।",
      });
      window.location.href = '/';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে।";
      toast({
        title: "ত্রুটি",
        description: errorMessage,
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
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-primary">পাসওয়ার্ড রিসেট</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  চিন্তা করবেন না! আপনার ইমেইল ঠিকানা দিন এবং আমরা পাসওয়ার্ড রিসেট লিংক পাঠাবো।
                </p>
              </div>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">ইমেইল ঠিকানা</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="আপনার ইমেইল ঠিকানা লিখুন"
                    className="text-center"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  রিসেট লিংক পাঠান
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setEmail("");
                  }}
                >
                  লগিনে ফিরে যান
                </Button>
              </form>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  💡 টিপস: আপনার ইনবক্স এবং স্প্যাম ফোল্ডার উভয়ই চেক করুন
                </p>
              </div>
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
                    className="w-full text-primary hover:text-primary/80 font-medium"
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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Phone, Edit, Trash2, Loader2, Search, ArrowLeft } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  
  const { customers, loading: customersLoading, refetch } = useCustomers();
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('customers')
        .insert([{
          ...newCustomer,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "নতুন গ্রাহক যোগ করা হয়েছে।",
      });
      
      setNewCustomer({ name: "", phone: "" });
      setShowAddDialog(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('customers')
        .update({
          name: editingCustomer.name,
          phone: editingCustomer.phone,
        })
        .eq('id', editingCustomer.id)
        .eq('user_id', user.id); // Ensure user can only update their own customers

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "গ্রাহকের তথ্য আপডেট করা হয়েছে।",
      });
      
      setEditingCustomer(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('user_id', user.id); // Ensure user can only delete their own customers

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "গ্রাহক মুছে ফেলা হয়েছে।",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              ফিরে যান
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">গ্রাহক ব্যবস্থাপনা</h1>
              <p className="text-muted-foreground">সকল গ্রাহকের তালিকা ও ব্যবস্থাপনা</p>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                নতুন গ্রাহক
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন গ্রাহক যোগ করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">গ্রাহকের নাম</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">ফোন নম্বর</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="০১৭১২৩৪৫৬৭৮"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    যোগ করুন
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    বাতিল
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="গ্রাহক খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customers Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customersLoading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>কোনো গ্রাহক পাওয়া যায়নি</p>
              <p className="text-sm">নতুন গ্রাহক যোগ করুন</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>গ্রাহক সম্পাদনা করুন</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleUpdateCustomer} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="editName">গ্রাহকের নাম</Label>
                              <Input
                                id="editName"
                                value={editingCustomer?.name || ""}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editPhone">ফোন নম্বর</Label>
                              <Input
                                id="editPhone"
                                value={editingCustomer?.phone || ""}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                placeholder="০১৭১২৩৪৫৬৭৮"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={loading} className="flex-1">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                আপডেট করুন
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setEditingCustomer(null)}>
                                বাতিল
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>গ্রাহক মুছুন</AlertDialogTitle>
                            <AlertDialogDescription>
                              আপনি কি নিশ্চিত যে আপনি {customer.name} কে মুছতে চান? এই কাজটি অপরিবর্তনীয়।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              মুছুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ব্যালেন্স:</span>
                      {customer.due_amount > 0 ? (
                        <Badge variant="destructive">
                          বাকি: {formatAmount(customer.due_amount)}
                        </Badge>
                      ) : customer.due_amount < 0 ? (
                        <Badge variant="secondary">
                          দিতে হবে: {formatAmount(customer.due_amount)}
                        </Badge>
                      ) : (
                        <Badge variant="outline">সমান</Badge>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      বিস্তারিত দেখুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers; 
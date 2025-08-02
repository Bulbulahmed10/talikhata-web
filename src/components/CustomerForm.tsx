import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload, Camera, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
  onSuccess: () => void;
  mode: 'add' | 'edit';
}

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  photo_url: string;
  send_email_notifications: boolean;
  send_sms_notifications: boolean;
}

const CustomerForm = ({ isOpen, onClose, customer, onSuccess, mode }: CustomerFormProps) => {
  const [formData, setFormData] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    photo_url: "",
    send_email_notifications: true,
    send_sms_notifications: false,
  });

  // Reset form data when modal opens or customer changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: customer?.name || "",
        phone: customer?.phone || "",
        email: customer?.email || "",
        address: customer?.address || "",
        description: customer?.description || "",
        photo_url: customer?.photo_url || "",
        send_email_notifications: customer?.send_email_notifications ?? true,
        send_sms_notifications: customer?.send_sms_notifications ?? false,
      });
      setPhotoPreview(customer?.photo_url || null);
    }
  }, [isOpen, customer]);
  
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(customer?.photo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof CustomerData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "ত্রুটি",
        description: "শুধুমাত্র ছবি আপলোড করা যাবে।",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "ত্রুটি",
        description: "ছবির আকার ৫ মেগাবাইটের কম হতে হবে।",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('customer-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('customer-photos')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        photo_url: publicUrl
      }));

      setPhotoPreview(publicUrl);

      toast({
        title: "সফল!",
        description: "ছবি আপলোড হয়েছে।",
      });

    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast({
        title: "ত্রুটি",
        description: "ছবি আপলোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }

    setUploadingPhoto(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const handleCameraCapture = () => {
    // This would integrate with device camera
    // For now, we'll just trigger file input
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo_url: ""
    }));
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const customerData = {
        ...formData,
        user_id: user.id
      };

      if (mode === 'add') {
        const { error } = await supabase
          .from('customers')
          .insert([customerData]);

        if (error) throw error;

        toast({
          title: "সফল!",
          description: "নতুন গ্রাহক যোগ করা হয়েছে।",
        });
      } else {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customer.id);

        if (error) throw error;

        toast({
          title: "সফল!",
          description: "গ্রাহকের তথ্য আপডেট হয়েছে।",
        });
      }

      onSuccess();
      onClose();
      
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'নতুন গ্রাহক যোগ করুন' : 'গ্রাহক সম্পাদনা করুন'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">গ্রাহকের ছবি</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoPreview || undefined} />
                  <AvatarFallback className="text-lg">
                    {photoPreview ? <User className="h-8 w-8" /> : getInitials(formData.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  ছবি আপলোড
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCameraCapture}
                  disabled={uploadingPhoto}
                >
                  <Camera className="h-4 w-4" />
                  ক্যামেরা
                </Button>
                
                {photoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removePhoto}
                    disabled={uploadingPhoto}
                  >
                    <X className="h-4 w-4" />
                    মুছুন
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">গ্রাহকের নাম *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="গ্রাহকের নাম লিখুন"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ফোন নম্বর *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                placeholder="০১৭১২৩৪৫৬৭৮"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">ঠিকানা</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="গ্রাহকের ঠিকানা লিখুন"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="গ্রাহক সম্পর্কে অতিরিক্ত তথ্য"
                rows={3}
              />
            </div>
          </div>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">বিজ্ঞপ্তি সেটিংস</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ইমেইল বিজ্ঞপ্তি</Label>
                  <p className="text-xs text-muted-foreground">
                    লেনদেনের বিজ্ঞপ্তি ইমেইলে পাঠানো হবে
                  </p>
                </div>
                <Switch
                  checked={formData.send_email_notifications}
                  onCheckedChange={(checked) => handleInputChange('send_email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>এসএমএস বিজ্ঞপ্তি</Label>
                  <p className="text-xs text-muted-foreground">
                    লেনদেনের বিজ্ঞপ্তি এসএমএসে পাঠানো হবে
                  </p>
                </div>
                <Switch
                  checked={formData.send_sms_notifications}
                  onCheckedChange={(checked) => handleInputChange('send_sms_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'add' ? 'যোগ করুন' : 'আপডেট করুন'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              বাতিল
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm; 
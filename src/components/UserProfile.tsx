import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Camera, X, User, Settings, Bell, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DarkModeToggle from "./DarkModeToggle";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any | null;
  onSuccess: () => void;
}

interface ProfileData {
  full_name: string;
  age: string;
  gender: string;
  profile_picture_url: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  dark_mode: boolean;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfile = ({ isOpen, onClose, user, profile, onSuccess }: UserProfileProps) => {
  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    age: "",
    gender: "",
    profile_picture_url: "",
    email_notifications: true,
    sms_notifications: false,
    dark_mode: false,
  });

  // Reset form data when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: profile?.full_name || "",
        age: profile?.age?.toString() || "",
        gender: profile?.gender || "",
        profile_picture_url: profile?.profile_picture_url || "",
        email_notifications: profile?.email_notifications ?? true,
        sms_notifications: profile?.sms_notifications ?? false,
        dark_mode: profile?.dark_mode ?? false,
      });
      setPhotoPreview(profile?.profile_picture_url || null);
    }
  }, [isOpen, profile]);
  
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.profile_picture_url || null);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
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
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

             // Upload to Supabase Storage
       const { data, error } = await supabase.storage
         .from('profile-photos')
         .upload(fileName, file, {
           cacheControl: '3600',
           upsert: false
         });

       if (error) throw error;

       // Get public URL
       const { data: { publicUrl } } = supabase.storage
         .from('profile-photos')
         .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        profile_picture_url: publicUrl
      }));

      setPhotoPreview(publicUrl);

      toast({
        title: "সফল!",
        description: "প্রোফাইল ছবি আপলোড হয়েছে।",
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

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profile_picture_url: ""
    }));
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        user_id: user.id
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "প্রোফাইল আপডেট হয়েছে।",
      });

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "ত্রুটি",
        description: "নতুন পাসওয়ার্ড দুটি মিলছে না।",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "পাসওয়ার্ড পরিবর্তন হয়েছে।",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordSection(false);

    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    }

    setChangingPassword(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            প্রোফাইল সেটিংস
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">প্রোফাইল ছবি</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoPreview || undefined} />
                  <AvatarFallback className="text-2xl">
                    {photoPreview ? <User className="h-10 w-10" /> : getInitials(formData.full_name || user.email)}
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
                  onClick={() => fileInputRef.current?.click()}
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

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ব্যক্তিগত তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">পূর্ণ নাম</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">বয়স</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="বয়স"
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">লিঙ্গ</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">পুরুষ</SelectItem>
                    <SelectItem value="female">মহিলা</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  ইমেইল পরিবর্তন করতে অ্যাকাউন্ট সেটিংস ব্যবহার করুন
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4" />
                বিজ্ঞপ্তি সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ইমেইল বিজ্ঞপ্তি</Label>
                  <p className="text-xs text-muted-foreground">
                    গুরুত্বপূর্ণ বিজ্ঞপ্তি ইমেইলে পাঠানো হবে
                  </p>
                </div>
                <Switch
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>এসএমএস বিজ্ঞপ্তি</Label>
                  <p className="text-xs text-muted-foreground">
                    গুরুত্বপূর্ণ বিজ্ঞপ্তি এসএমএসে পাঠানো হবে
                  </p>
                </div>
                <Switch
                  checked={formData.sms_notifications}
                  onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">পাসওয়ার্ড সেটিংস</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>পাসওয়ার্ড পরিবর্তন</Label>
                  <p className="text-xs text-muted-foreground">
                    আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                  {showPasswordSection ? "বাতিল" : "পরিবর্তন"}
                </Button>
              </div>

              {showPasswordSection && (
                <form onSubmit={handlePasswordChange} className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="নতুন পাসওয়ার্ড লিখুন"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="পাসওয়ার্ড আবার লিখুন"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={changingPassword} className="w-full" size="sm">
                    {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    পাসওয়ার্ড পরিবর্তন করুন
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">থিম সেটিংস</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ডার্ক মোড</Label>
                  <p className="text-xs text-muted-foreground">
                    অ্যাপের থিম পরিবর্তন করুন
                  </p>
                </div>
                <DarkModeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              আপডেট করুন
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

export default UserProfile; 
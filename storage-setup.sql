-- Storage Setup for TallyKhata
-- Run this in Supabase SQL Editor after creating the storage buckets

-- Storage policies for profile-photos bucket
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for customer-photos bucket
CREATE POLICY "Users can upload customer photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'customer-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view customer photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'customer-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update customer photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'customer-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete customer photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'customer-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
SELECT 'Storage policies created successfully!' as status; 
-- Storage policies for profile-photos bucket
-- Allow users to upload their own profile photos
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own profile photos
CREATE POLICY "Users can view their own profile photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile photos
CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile photos
CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for customer-photos bucket
-- Allow users to upload customer photos
CREATE POLICY "Users can upload customer photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'customer-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view customer photos
CREATE POLICY "Users can view customer photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'customer-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update customer photos
CREATE POLICY "Users can update customer photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'customer-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete customer photos
CREATE POLICY "Users can delete customer photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'customer-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
); 
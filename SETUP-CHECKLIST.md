# Complete Setup Checklist for TallyKhata

## ✅ Completed Features
- [x] PWA Install Button (already working)
- [x] Dark Mode Toggle
- [x] Google OAuth Integration
- [x] Password Show/Hide Toggle
- [x] Forgot Password Functionality
- [x] Enhanced Customer Forms
- [x] Transaction Forms with Debt Reminders
- [x] User Profile Management
- [x] Responsive UI Design
- [x] Smart Calculation System

## 🔧 Setup Steps Required

### 1. Database Migration
**Status**: ❌ Pending

**Action Required**:
- Run the database migration to add new fields
- You can do this manually in Supabase SQL Editor

**SQL to run in Supabase Dashboard**:
```sql
-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;

-- Add new fields to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS send_email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS send_sms_notifications BOOLEAN DEFAULT false;

-- Add new fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_type TEXT CHECK (reminder_type IN ('email', 'sms', 'both')),
ADD COLUMN IF NOT EXISTS reminder_date DATE;
```

### 2. Supabase Storage Setup
**Status**: ❌ Pending

**Action Required**:
1. Go to Supabase Dashboard → Storage
2. Create bucket: `profile-photos`
   - Public bucket: ✅
   - File size limit: 5MB
   - Allowed MIME types: `image/*`
3. Create bucket: `customer-photos`
   - Public bucket: ✅
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

### 3. Storage Policies
**Status**: ❌ Pending

**Action Required**:
Run this SQL in Supabase SQL Editor:

```sql
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
```

### 4. Google OAuth Configuration
**Status**: ✅ Completed (you mentioned this is done)

**Verification**:
- [ ] Test Google login functionality
- [ ] Verify Google profile data is being saved

### 5. Email Service Setup
**Status**: ❌ Pending

**Options**:
1. **SendGrid** (Recommended)
   - Create SendGrid account
   - Get API key
   - Set up Edge Function (see EMAIL-SETUP.md)

2. **Resend**
   - Create Resend account
   - Get API key
   - Set up Edge Function

3. **SMTP**
   - Configure SMTP settings
   - Use nodemailer

### 6. Debt Reminder System
**Status**: ⚠️ Partially Complete

**Action Required**:
- Set up cron job or scheduled function for debt reminders
- Configure email/SMS service for reminders

### 7. Testing Checklist
**Status**: ❌ Pending

**Test these features**:
- [ ] Customer photo upload
- [ ] User profile photo upload
- [ ] Google login
- [ ] Password show/hide
- [ ] Forgot password
- [ ] Dark mode toggle
- [ ] Transaction with debt reminder
- [ ] Email notifications
- [ ] PWA install on mobile
- [ ] Responsive design on mobile

## 🚀 Quick Start Guide

### Step 1: Database Setup
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run the database migration SQL (above)
4. Run the storage policies SQL (above)

### Step 2: Storage Setup
1. Go to Storage in Supabase Dashboard
2. Create `profile-photos` bucket
3. Create `customer-photos` bucket
4. Set both as public with 5MB limit

### Step 3: Email Setup
1. Choose email service (SendGrid recommended)
2. Follow EMAIL-SETUP.md guide
3. Deploy Edge Function
4. Test email functionality

### Step 4: Testing
1. Test all features listed above
2. Verify mobile responsiveness
3. Test PWA installation

## 📱 Mobile Testing

Test these on mobile devices:
- [ ] PWA install button appears
- [ ] Photo upload works
- [ ] Forms are responsive
- [ ] Dark mode works
- [ ] Google login works
- [ ] All features work offline (PWA)

## 🔧 Troubleshooting

### Common Issues:
1. **Photo upload fails**: Check storage bucket permissions
2. **Google login fails**: Verify OAuth configuration
3. **Email not sending**: Check Edge Function and API keys
4. **Database errors**: Run migration SQL manually

### Support:
- Check Supabase logs for errors
- Verify environment variables
- Test each feature individually

## ✅ Final Verification

Before going live:
- [ ] All features tested
- [ ] Mobile responsive
- [ ] PWA working
- [ ] Email notifications working
- [ ] Photo uploads working
- [ ] Google login working
- [ ] Dark mode working
- [ ] Database migration complete
- [ ] Storage buckets created
- [ ] Storage policies applied 
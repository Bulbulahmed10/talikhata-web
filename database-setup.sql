-- Database Setup for TallyKhata
-- Run this in Supabase SQL Editor

-- 1. Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;

-- 2. Add new fields to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS send_email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS send_sms_notifications BOOLEAN DEFAULT false;

-- 3. Add new fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_type TEXT CHECK (reminder_type IN ('email', 'sms', 'both')),
ADD COLUMN IF NOT EXISTS reminder_date DATE;

-- 4. Create debt_reminders table
CREATE TABLE IF NOT EXISTS public.debt_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_type TEXT CHECK (reminder_type IN ('email', 'sms', 'both')) NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.debt_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for debt_reminders
CREATE POLICY "Users can view their own debt reminders" ON public.debt_reminders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt reminders" ON public.debt_reminders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt reminders" ON public.debt_reminders
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt reminders" ON public.debt_reminders
FOR DELETE USING (auth.uid() = user_id);

-- 9. Create RLS policies for password_reset_tokens
CREATE POLICY "Users can view their own reset tokens" ON public.password_reset_tokens
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reset tokens" ON public.password_reset_tokens
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reset tokens" ON public.password_reset_tokens
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reset tokens" ON public.password_reset_tokens
FOR DELETE USING (auth.uid() = user_id);

-- 10. Create RLS policies for email_templates (admin only for now)
CREATE POLICY "Allow all operations on email_templates" ON public.email_templates
FOR ALL USING (true);

-- 11. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Create triggers for updated_at
CREATE TRIGGER update_debt_reminders_updated_at 
    BEFORE UPDATE ON public.debt_reminders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON public.email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Insert default email templates
INSERT INTO public.email_templates (name, subject, body, variables) VALUES
('debt_reminder', 'ঋণ পরিশোধের স্মরণিকা', 
'প্রিয় {{customer_name}},\n\nআপনার {{amount}} টাকার ঋণ {{due_date}} তারিখে পরিশোধের তারিখ। অনুগ্রহ করে সময়মত পরিশোধ করুন।\n\nধন্যবাদ,\n{{business_name}}', 
'{"customer_name": "", "amount": "", "due_date": "", "business_name": ""}'),
('transaction_notification', 'লেনদেনের বিজ্ঞপ্তি', 
'প্রিয় {{customer_name}},\n\nআপনার সাথে {{transaction_type}} লেনদেন হয়েছে। পরিমাণ: {{amount}} টাকা।\n\nধন্যবাদ,\n{{business_name}}', 
'{"customer_name": "", "transaction_type": "", "amount": "", "business_name": ""}')
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as status; 
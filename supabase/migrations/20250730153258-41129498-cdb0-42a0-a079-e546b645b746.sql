-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_customer_due_amount()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update due amount based on transaction type
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'given' THEN
      UPDATE public.customers 
      SET due_amount = due_amount + NEW.amount 
      WHERE id = NEW.customer_id;
    ELSIF NEW.type = 'received' THEN
      UPDATE public.customers 
      SET due_amount = due_amount - NEW.amount 
      WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'given' THEN
      UPDATE public.customers 
      SET due_amount = due_amount - OLD.amount 
      WHERE id = OLD.customer_id;
    ELSIF OLD.type = 'received' THEN
      UPDATE public.customers 
      SET due_amount = due_amount + OLD.amount 
      WHERE id = OLD.customer_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, business_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'business_name', 'আমার দোকান'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NEW.phone)
  );
  RETURN NEW;
END;
$$;

-- Add new fields to profiles table for user profile management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;

-- Add new fields to customers table for enhanced customer profiles
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS send_email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS send_sms_notifications BOOLEAN DEFAULT false;

-- Add new fields to transactions table for debt reminders
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_type TEXT CHECK (reminder_type IN ('email', 'sms', 'both')),
ADD COLUMN IF NOT EXISTS reminder_date DATE;

-- Create debt_reminders table for tracking debt reminders
CREATE TABLE IF NOT EXISTS public.debt_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  reminder_date DATE NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'both')),
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create password_reset_tokens table for password reset functionality
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_templates table for customizable email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE public.debt_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for debt_reminders
CREATE POLICY "Users can view their own debt reminders" 
ON public.debt_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debt reminders" 
ON public.debt_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt reminders" 
ON public.debt_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt reminders" 
ON public.debt_reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for password_reset_tokens
CREATE POLICY "Users can view their own reset tokens" 
ON public.password_reset_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reset tokens" 
ON public.password_reset_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reset tokens" 
ON public.password_reset_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for email_templates
CREATE POLICY "Users can view their own email templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates" 
ON public.email_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates" 
ON public.email_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for email_templates timestamp updates
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create debt reminder when transaction is created
CREATE OR REPLACE FUNCTION public.create_debt_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create reminder for 'given' transactions with due_date
  IF NEW.type = 'given' AND NEW.due_date IS NOT NULL THEN
    INSERT INTO public.debt_reminders (
      user_id,
      customer_id,
      transaction_id,
      due_date,
      reminder_date,
      reminder_type
    ) VALUES (
      NEW.user_id,
      NEW.customer_id,
      NEW.id,
      NEW.due_date,
      NEW.due_date - INTERVAL '1 day', -- Send reminder 1 day before
      COALESCE(NEW.reminder_type, 'email')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create debt reminders
CREATE TRIGGER create_debt_reminder_trigger
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_debt_reminder();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debt_reminders_user_id ON public.debt_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_reminders_customer_id ON public.debt_reminders(customer_id);
CREATE INDEX IF NOT EXISTS idx_debt_reminders_due_date ON public.debt_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_debt_reminders_sent ON public.debt_reminders(sent);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON public.email_templates(user_id);

-- Insert default email templates
INSERT INTO public.email_templates (user_id, template_name, subject, body, is_default) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  'transaction_notification',
  'তালিখাতা - লেনদেনের বিজ্ঞপ্তি',
  '<!DOCTYPE html>
<html dir="rtl" lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>তালিখাতা - লেনদেনের বিজ্ঞপ্তি</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .amount { font-size: 24px; font-weight: bold; color: #4CAF50; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>তালিখাতা</h1>
            <p>আপনার লেনদেনের বিজ্ঞপ্তি</p>
        </div>
        <div class="content">
            <p>প্রিয় {{customer_name}},</p>
            <p>{{transaction_message}}</p>
            <p class="amount">{{amount}} ৳</p>
            <p><strong>তারিখ:</strong> {{date}}</p>
            <p><strong>বিবরণ:</strong> {{note}}</p>
            <p>ধন্যবাদ,<br>তালিখাতা টিম</p>
        </div>
        <div class="footer">
            <p>এই ইমেইল তালিখাতা থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।</p>
        </div>
    </div>
</body>
</html>',
  true
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'debt_reminder',
  'তালিখাতা - ঋণ পরিশোধের স্মরণিকা',
  '<!DOCTYPE html>
<html dir="rtl" lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>তালিখাতা - ঋণ পরিশোধের স্মরণিকা</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .amount { font-size: 24px; font-weight: bold; color: #FF9800; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>তালিখাতা</h1>
            <p>ঋণ পরিশোধের স্মরণিকা</p>
        </div>
        <div class="content">
            <p>প্রিয় {{customer_name}},</p>
            <p>আপনার ঋণ পরিশোধের তারিখ {{due_date}}। অনুগ্রহ করে {{store_name}} থেকে {{amount}} ৳ পরিশোধ করুন।</p>
            <p class="amount">{{amount}} ৳</p>
            <p><strong>পরিশোধের তারিখ:</strong> {{due_date}}</p>
            <p>ধন্যবাদ,<br>{{store_name}}</p>
        </div>
        <div class="footer">
            <p>এই ইমেইল তালিখাতা থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।</p>
        </div>
    </div>
</body>
</html>',
  true
);
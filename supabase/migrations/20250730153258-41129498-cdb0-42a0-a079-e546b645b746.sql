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
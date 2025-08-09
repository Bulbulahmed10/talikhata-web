-- Fix the update_customer_due_amount function to properly handle refund_amount
CREATE OR REPLACE FUNCTION public.update_customer_due_amount()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update due amount based on transaction type and refund
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'given' THEN
      UPDATE public.customers 
      SET due_amount = due_amount + NEW.amount - COALESCE(NEW.refund_amount, 0)
      WHERE id = NEW.customer_id;
    ELSIF NEW.type = 'received' THEN
      UPDATE public.customers 
      SET due_amount = due_amount - NEW.amount + COALESCE(NEW.refund_amount, 0)
      WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'given' THEN
      UPDATE public.customers 
      SET due_amount = due_amount - OLD.amount + COALESCE(OLD.refund_amount, 0)
      WHERE id = OLD.customer_id;
    ELSIF OLD.type = 'received' THEN
      UPDATE public.customers 
      SET due_amount = due_amount + OLD.amount - COALESCE(OLD.refund_amount, 0)
      WHERE id = OLD.customer_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- First, reverse the old transaction
    IF OLD.type = 'given' THEN
      UPDATE public.customers 
      SET due_amount = due_amount - OLD.amount + COALESCE(OLD.refund_amount, 0)
      WHERE id = OLD.customer_id;
    ELSIF OLD.type = 'received' THEN
      UPDATE public.customers 
      SET due_amount = due_amount + OLD.amount - COALESCE(OLD.refund_amount, 0)
      WHERE id = OLD.customer_id;
    END IF;
    
    -- Then, apply the new transaction
    IF NEW.type = 'given' THEN
      UPDATE public.customers 
      SET due_amount = due_amount + NEW.amount - COALESCE(NEW.refund_amount, 0)
      WHERE id = NEW.customer_id;
    ELSIF NEW.type = 'received' THEN
      UPDATE public.customers 
      SET due_amount = due_amount - NEW.amount + COALESCE(NEW.refund_amount, 0)
      WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create a function to recalculate all customer balances
CREATE OR REPLACE FUNCTION public.recalculate_all_customer_balances()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  customer_record RECORD;
  calculated_balance DECIMAL(10,2);
  transaction_record RECORD;
BEGIN
  -- Loop through all customers
  FOR customer_record IN SELECT id FROM public.customers LOOP
    calculated_balance := 0;
    
    -- Calculate balance based on all transactions for this customer
    FOR transaction_record IN 
      SELECT type, amount, COALESCE(refund_amount, 0) as refund_amount 
      FROM public.transactions 
      WHERE customer_id = customer_record.id
    LOOP
      IF transaction_record.type = 'given' THEN
        calculated_balance := calculated_balance + transaction_record.amount - transaction_record.refund_amount;
      ELSIF transaction_record.type = 'received' THEN
        calculated_balance := calculated_balance - transaction_record.amount + transaction_record.refund_amount;
      END IF;
    END LOOP;
    
    -- Update customer balance
    UPDATE public.customers 
    SET due_amount = calculated_balance 
    WHERE id = customer_record.id;
  END LOOP;
END;
$$;

-- Execute the recalculation function to fix existing data
SELECT public.recalculate_all_customer_balances();

-- Add new fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS time TIME DEFAULT CURRENT_TIME,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_note TEXT;

-- Update the existing transactions to have current time
UPDATE public.transactions 
SET time = CURRENT_TIME 
WHERE time IS NULL;

-- Create index for time field
CREATE INDEX IF NOT EXISTS idx_transactions_time ON public.transactions(time);

-- Create index for refund_amount field
CREATE INDEX IF NOT EXISTS idx_transactions_refund_amount ON public.transactions(refund_amount);

-- Drop the existing trigger
DROP TRIGGER IF EXISTS update_customer_due_trigger ON public.transactions;

-- Update the function to handle refund amounts
CREATE OR REPLACE FUNCTION public.update_customer_due_amount()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update customer due amount
CREATE TRIGGER update_customer_due_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_due_amount();

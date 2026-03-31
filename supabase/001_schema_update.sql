-- Supabase SQL Migration to add Credits table and Expenses category
-- Ensure existing datasets remain intact

-- 1. Create Credits Table
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('paid', 'staff')),
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 2. Add Category to Expenses
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('petty_cash', 'hgp', 'register')) DEFAULT 'petty_cash';

-- 3. Triggers for Credits
CREATE TRIGGER update_credits_updated_at
BEFORE UPDATE ON public.credits
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER credits_audit
AFTER INSERT OR UPDATE OR DELETE ON public.credits
FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

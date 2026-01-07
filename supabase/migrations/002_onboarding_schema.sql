-- MoneyLoop Onboarding Schema Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- ONBOARDING PROGRESS TABLE
-- Tracks user's onboarding state and progress
-- ============================================
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    onboarding_path text CHECK (onboarding_path IN ('ai_assisted', 'manual', 'skipped')),
    current_step text,
    completed_steps jsonb DEFAULT '[]',
    bank_connected boolean DEFAULT false,
    email_connected boolean DEFAULT false,
    income_entered boolean DEFAULT false,
    expenses_entered boolean DEFAULT false,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own onboarding progress" ON public.onboarding_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress" ON public.onboarding_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON public.onboarding_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- Recurring expenses (detected or manual)
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    category text,
    amount numeric NOT NULL,
    frequency text CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'annually')),
    next_billing_date date,
    source text CHECK (source IN ('plaid', 'email', 'manual')),
    is_active boolean DEFAULT true,
    detected_at timestamptz,
    confirmed boolean DEFAULT false,
    logo_color text DEFAULT '#6366f1',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MANUAL EXPENSES TABLE
-- One-time or categorized expenses
-- ============================================
CREATE TABLE IF NOT EXISTS public.manual_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    amount numeric NOT NULL,
    frequency text CHECK (frequency IN ('one-time', 'weekly', 'monthly', 'quarterly', 'annually')),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own manual expenses" ON public.manual_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own manual expenses" ON public.manual_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manual expenses" ON public.manual_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own manual expenses" ON public.manual_expenses
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_source ON public.subscriptions(source);
CREATE INDEX IF NOT EXISTS idx_manual_expenses_user_id ON public.manual_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_expenses_category ON public.manual_expenses(category);

-- ============================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_onboarding_progress_updated_at
    BEFORE UPDATE ON public.onboarding_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

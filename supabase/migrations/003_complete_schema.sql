-- Complete Schema Migration for MoneyLoop AI Financial Agent Platform
-- Phase 1: Foundation tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- CORE TABLES
-- ================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    avatar_url text,
    tier text DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'business', 'family')),
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Institutions (linked bank/financial institutions)
CREATE TABLE IF NOT EXISTS public.institutions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plaid_item_id text,
    plaid_institution_id text,
    access_token text,
    institution_name text,
    logo_url text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'error', 'disconnected')),
    last_synced_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Accounts (bank accounts, credit cards, investments)
CREATE TABLE IF NOT EXISTS public.accounts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
    plaid_account_id text,
    name text NOT NULL,
    official_name text,
    mask text,
    type text NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'loan', 'mortgage', 'other')),
    subtype text,
    balance numeric(15,2) DEFAULT 0,
    available_balance numeric(15,2),
    currency text DEFAULT 'USD',
    is_hidden boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
    plaid_transaction_id text UNIQUE,
    date date NOT NULL,
    amount numeric(15,2) NOT NULL,
    name text NOT NULL,
    merchant_name text,
    category text,
    subcategory text,
    pending boolean DEFAULT false,
    notes text,
    tags text[],
    is_recurring boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ================================================
-- BUDGETS & GOALS
-- ================================================

-- Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category text NOT NULL,
    amount numeric(15,2) NOT NULL,
    period text DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
    spent numeric(15,2) DEFAULT 0,
    rollover boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, category, period)
);

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    target_amount numeric(15,2) NOT NULL,
    current_amount numeric(15,2) DEFAULT 0,
    target_date date,
    color text DEFAULT 'emerald',
    icon text DEFAULT 'target',
    linked_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
    auto_contribute boolean DEFAULT false,
    contribution_amount numeric(15,2),
    contribution_frequency text CHECK (contribution_frequency IN ('weekly', 'biweekly', 'monthly')),
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Income Streams
CREATE TABLE IF NOT EXISTS public.income_streams (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    source text,
    amount numeric(15,2) NOT NULL,
    frequency text DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annual', 'variable')),
    next_date date,
    icon text DEFAULT 'briefcase',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ================================================
-- BILLS & SUBSCRIPTIONS
-- ================================================

-- Bills
CREATE TABLE IF NOT EXISTS public.bills (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    amount numeric(15,2) NOT NULL,
    due_date date NOT NULL,
    frequency text DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annual', 'once')),
    category text,
    biller_website text,
    account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
    autopay boolean DEFAULT false,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'scheduled')),
    last_paid_date date,
    reminders_enabled boolean DEFAULT true,
    reminder_days_before int DEFAULT 3,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    service_name text NOT NULL,
    amount numeric(15,2) NOT NULL,
    billing_frequency text DEFAULT 'monthly' CHECK (billing_frequency IN ('weekly', 'monthly', 'quarterly', 'annual')),
    next_billing_date date,
    category text,
    logo_url text,
    website text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused', 'trial')),
    usage_score numeric(3,2),
    last_used_at timestamptz,
    detected_from text,
    can_cancel_online boolean DEFAULT true,
    cancellation_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ================================================
-- ONBOARDING & PROGRESS
-- ================================================

-- Onboarding Progress
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    onboarding_path text CHECK (onboarding_path IN ('ai_assisted', 'manual', 'skipped')),
    current_step text,
    completed_steps text[] DEFAULT '{}',
    data jsonb DEFAULT '{}',
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    updated_at timestamptz DEFAULT now()
);

-- ================================================
-- AI AGENT SYSTEM (Phase 2)
-- ================================================

-- Agent Actions (Human-in-the-Loop tracking)
CREATE TABLE IF NOT EXISTS public.agent_actions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    agent_type text NOT NULL CHECK (agent_type IN ('budget', 'bill', 'subscription', 'grocery', 'tax', 'investment', 'insights', 'coordinator')),
    action_type text NOT NULL,
    status text DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'declined', 'executed', 'failed', 'expired')),
    proposal_data jsonb NOT NULL,
    execution_result jsonb,
    risk_level text DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    approved_at timestamptz,
    executed_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL CHECK (type IN ('pattern', 'threshold', 'opportunity', 'predictive', 'comparative', 'goal', 'bill', 'subscription')),
    severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    title text NOT NULL,
    message text NOT NULL,
    impact text,
    action_label text,
    action_url text,
    dismissed boolean DEFAULT false,
    dismissed_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- AI Conversations (for chat interface)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    messages jsonb DEFAULT '[]',
    context jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_institutions_user_id ON public.institutions(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_institution_id ON public.accounts(institution_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.bills(due_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_user_id ON public.agent_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_status ON public.agent_actions(status);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_dismissed ON public.alerts(dismissed);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own profiles" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own institutions" ON public.institutions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own income_streams" ON public.income_streams FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bills" ON public.bills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own onboarding_progress" ON public.onboarding_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own agent_actions" ON public.agent_actions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alerts" ON public.alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ai_conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['profiles', 'institutions', 'accounts', 'transactions', 'budgets', 'goals', 'income_streams', 'bills', 'subscriptions', 'onboarding_progress', 'ai_conversations'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%s', t, t);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$;

-- Function to calculate budget spent from transactions
CREATE OR REPLACE FUNCTION calculate_budget_spent(p_user_id uuid, p_category text, p_period text)
RETURNS numeric AS $$
DECLARE
    spent numeric;
    start_date date;
BEGIN
    -- Determine start date based on period
    CASE p_period
        WHEN 'weekly' THEN start_date := date_trunc('week', current_date)::date;
        WHEN 'monthly' THEN start_date := date_trunc('month', current_date)::date;
        WHEN 'yearly' THEN start_date := date_trunc('year', current_date)::date;
        ELSE start_date := date_trunc('month', current_date)::date;
    END CASE;
    
    SELECT COALESCE(SUM(ABS(amount)), 0) INTO spent
    FROM public.transactions
    WHERE user_id = p_user_id
      AND category = p_category
      AND amount < 0
      AND date >= start_date;
    
    RETURN spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

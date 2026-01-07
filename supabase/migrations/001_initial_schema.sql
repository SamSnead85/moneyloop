-- MoneyLoop Database Schema
-- Run this migration in your Supabase SQL editor

-- =====================================================
-- Connected Financial Institutions
-- =====================================================
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plaid_item_id TEXT UNIQUE,
  access_token TEXT NOT NULL,
  institution_name TEXT,
  institution_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'error', 'disconnected')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_institutions_user_id ON institutions(user_id);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status);

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see their own institutions
CREATE POLICY "Users can view own institutions" ON institutions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own institutions" ON institutions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own institutions" ON institutions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own institutions" ON institutions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Financial Accounts
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  plaid_account_id TEXT UNIQUE,
  name TEXT NOT NULL,
  official_name TEXT,
  type TEXT NOT NULL, -- checking, savings, credit, investment, loan, etc.
  subtype TEXT,
  current_balance DECIMAL(15,2),
  available_balance DECIMAL(15,2),
  credit_limit DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_institution_id ON accounts(institution_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see accounts from their institutions
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (
    institution_id IN (
      SELECT id FROM institutions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (
    institution_id IN (
      SELECT id FROM institutions WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- Transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT UNIQUE,
  amount DECIMAL(15,2) NOT NULL, -- Positive = expense, Negative = income (Plaid convention)
  date DATE NOT NULL,
  name TEXT NOT NULL,
  merchant_name TEXT,
  category TEXT[], -- Array of category hierarchy
  primary_category TEXT, -- Main category for easier filtering
  pending BOOLEAN DEFAULT FALSE,
  transaction_type TEXT, -- place, digital, special, unresolved
  payment_channel TEXT, -- online, in store, other
  location_city TEXT,
  location_state TEXT,
  notes TEXT, -- User-added notes
  is_excluded BOOLEAN DEFAULT FALSE, -- Exclude from budgets/reports
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_primary_category ON transactions(primary_category);
CREATE INDEX IF NOT EXISTS idx_transactions_pending ON transactions(pending);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    account_id IN (
      SELECT a.id FROM accounts a
      JOIN institutions i ON a.institution_id = i.id
      WHERE i.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (
    account_id IN (
      SELECT a.id FROM accounts a
      JOIN institutions i ON a.institution_id = i.id
      WHERE i.user_id = auth.uid()
    )
  );

-- =====================================================
-- Manual Assets (Real Estate, Vehicles, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS manual_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- real_estate, vehicle, collectible, other
  current_value DECIMAL(15,2),
  purchase_value DECIMAL(15,2),
  purchase_date DATE,
  notes TEXT,
  metadata JSONB, -- Flexible storage for type-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_manual_assets_user_id ON manual_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_assets_type ON manual_assets(type);

-- Enable RLS
ALTER TABLE manual_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own manual assets" ON manual_assets
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- Balance History (for net worth tracking over time)
-- =====================================================
CREATE TABLE IF NOT EXISTS balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_assets DECIMAL(15,2),
  total_liabilities DECIMAL(15,2),
  net_worth DECIMAL(15,2),
  breakdown JSONB, -- Detailed breakdown by account type
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for time-series queries
CREATE INDEX IF NOT EXISTS idx_balance_history_user_date ON balance_history(user_id, date DESC);

-- Enable RLS
ALTER TABLE balance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance history" ON balance_history
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- Helper function to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manual_assets_updated_at
  BEFORE UPDATE ON manual_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

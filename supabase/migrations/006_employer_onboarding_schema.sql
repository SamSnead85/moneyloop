-- ================================================
-- EMPLOYER ONBOARDING SCHEMA
-- Production-ready tables for employer company data
-- ================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- EMPLOYER COMPANIES TABLE
-- Core company information for employers
-- ================================================
CREATE TABLE IF NOT EXISTS public.employer_companies (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Legal Information
    legal_name text NOT NULL,
    dba_name text,
    entity_type text NOT NULL CHECK (entity_type IN ('llc', 'corporation', 's_corp', 'partnership', 'sole_proprietorship', 'nonprofit')),
    ein text NOT NULL, -- Format: XX-XXXXXXX
    industry text,
    
    -- Address
    address_street1 text NOT NULL,
    address_street2 text,
    address_city text NOT NULL,
    address_state text NOT NULL,
    address_zip text NOT NULL,
    address_country text DEFAULT 'US',
    
    -- Contact
    phone text,
    website text,
    
    -- Status
    onboarding_completed boolean DEFAULT false,
    onboarding_step text DEFAULT 'company',
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id)
);

-- ================================================
-- EMPLOYER PAYROLL CONFIG TABLE
-- Payroll settings for the company
-- ================================================
CREATE TABLE IF NOT EXISTS public.employer_payroll_config (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid REFERENCES public.employer_companies(id) ON DELETE CASCADE NOT NULL,
    
    -- Pay Schedule
    pay_frequency text NOT NULL CHECK (pay_frequency IN ('weekly', 'bi-weekly', 'semi-monthly', 'monthly')),
    first_pay_date date NOT NULL,
    
    -- Team Size
    employee_count_range text NOT NULL, -- '1-5', '6-10', '11-25', '26-50', '51-100', '100+'
    has_contractors boolean DEFAULT false,
    
    -- Tax Settings
    federal_tax_deposit_schedule text DEFAULT 'monthly' CHECK (federal_tax_deposit_schedule IN ('monthly', 'semi-weekly')),
    state_tax_jurisdictions text[] DEFAULT '{}',
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(company_id)
);

-- ================================================
-- EMPLOYER BANKING TABLE
-- Bank account information for payroll
-- ================================================
CREATE TABLE IF NOT EXISTS public.employer_banking (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid REFERENCES public.employer_companies(id) ON DELETE CASCADE NOT NULL,
    
    -- Bank Details (encrypted at rest by Supabase)
    bank_name text,
    account_type text CHECK (account_type IN ('checking', 'savings')),
    routing_number text, -- 9 digits
    account_number_masked text, -- Last 4 only for display
    account_number_encrypted text, -- Full number, encrypted
    
    -- Integration
    plaid_item_id text,
    plaid_account_id text,
    use_mercury boolean DEFAULT false,
    
    -- Verification
    is_verified boolean DEFAULT false,
    verified_at timestamptz,
    verification_method text CHECK (verification_method IN ('plaid', 'micro_deposits', 'manual')),
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(company_id)
);

-- ================================================
-- EMPLOYER BENEFITS CONFIG TABLE
-- Benefits package configuration
-- ================================================
CREATE TABLE IF NOT EXISTS public.employer_benefits_config (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid REFERENCES public.employer_companies(id) ON DELETE CASCADE NOT NULL,
    
    -- Health Insurance
    offers_health_insurance boolean DEFAULT false,
    health_insurance_provider text,
    health_employer_contribution_pct numeric(5,2) DEFAULT 0,
    
    -- Retirement
    offers_401k boolean DEFAULT false,
    has_employer_match boolean DEFAULT false,
    employer_match_pct numeric(5,2) DEFAULT 0,
    employer_match_limit_pct numeric(5,2) DEFAULT 0,
    
    -- Time Off
    offers_pto boolean DEFAULT true,
    pto_days_per_year integer DEFAULT 15,
    pto_accrual_method text DEFAULT 'yearly' CHECK (pto_accrual_method IN ('yearly', 'monthly', 'per_pay_period')),
    
    -- Other Benefits
    offers_dental boolean DEFAULT false,
    offers_vision boolean DEFAULT false,
    offers_life_insurance boolean DEFAULT false,
    offers_disability boolean DEFAULT false,
    offers_fsa boolean DEFAULT false,
    offers_hsa boolean DEFAULT false,
    
    -- Custom Benefits (JSONB for flexibility)
    custom_benefits jsonb DEFAULT '[]',
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(company_id)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_employer_companies_user_id ON public.employer_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_companies_status ON public.employer_companies(status);
CREATE INDEX IF NOT EXISTS idx_employer_payroll_config_company_id ON public.employer_payroll_config(company_id);
CREATE INDEX IF NOT EXISTS idx_employer_banking_company_id ON public.employer_banking(company_id);
CREATE INDEX IF NOT EXISTS idx_employer_benefits_config_company_id ON public.employer_benefits_config(company_id);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE public.employer_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_payroll_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_banking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_benefits_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employer_companies
CREATE POLICY "Users can view own company" ON public.employer_companies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company" ON public.employer_companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company" ON public.employer_companies
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for employer_payroll_config (via company join)
CREATE POLICY "Users can manage own payroll config" ON public.employer_payroll_config
    FOR ALL USING (
        company_id IN (SELECT id FROM public.employer_companies WHERE user_id = auth.uid())
    );

-- RLS Policies for employer_banking (via company join)
CREATE POLICY "Users can manage own banking" ON public.employer_banking
    FOR ALL USING (
        company_id IN (SELECT id FROM public.employer_companies WHERE user_id = auth.uid())
    );

-- RLS Policies for employer_benefits_config (via company join)
CREATE POLICY "Users can manage own benefits config" ON public.employer_benefits_config
    FOR ALL USING (
        company_id IN (SELECT id FROM public.employer_companies WHERE user_id = auth.uid())
    );

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_employer_companies_updated_at
    BEFORE UPDATE ON public.employer_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_payroll_config_updated_at
    BEFORE UPDATE ON public.employer_payroll_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_banking_updated_at
    BEFORE UPDATE ON public.employer_banking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_benefits_config_updated_at
    BEFORE UPDATE ON public.employer_benefits_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

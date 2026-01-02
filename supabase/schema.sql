-- MoneyLoop Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text,
    full_name text,
    avatar_url text,
    subscription_tier text default 'free' check (subscription_tier in ('free', 'premium', 'family')),
    stripe_customer_id text unique,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Accounts table (connected financial accounts)
create table if not exists public.accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    institution text,
    type text not null check (type in ('checking', 'savings', 'credit', 'investment', 'property', 'alternative', 'other')),
    subtype text,
    balance numeric default 0,
    currency text default 'USD',
    last_synced timestamptz,
    plaid_account_id text,
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on accounts
alter table public.accounts enable row level security;

-- Accounts policies
create policy "Users can view own accounts" on public.accounts
    for select using (auth.uid() = user_id);

create policy "Users can insert own accounts" on public.accounts
    for insert with check (auth.uid() = user_id);

create policy "Users can update own accounts" on public.accounts
    for update using (auth.uid() = user_id);

create policy "Users can delete own accounts" on public.accounts
    for delete using (auth.uid() = user_id);

-- Transactions table
create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users on delete cascade not null,
    account_id uuid references public.accounts on delete cascade,
    name text not null,
    amount numeric not null,
    category text,
    subcategory text,
    date timestamptz default now(),
    pending boolean default false,
    plaid_transaction_id text,
    metadata jsonb default '{}',
    created_at timestamptz default now()
);

-- Enable RLS on transactions
alter table public.transactions enable row level security;

-- Transactions policies
create policy "Users can view own transactions" on public.transactions
    for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions
    for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on public.transactions
    for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on public.transactions
    for delete using (auth.uid() = user_id);

-- Goals table
create table if not exists public.goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    description text,
    target_amount numeric not null,
    current_amount numeric default 0,
    deadline date,
    color text default 'blue',
    icon text,
    completed boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on goals
alter table public.goals enable row level security;

-- Goals policies
create policy "Users can view own goals" on public.goals
    for select using (auth.uid() = user_id);

create policy "Users can insert own goals" on public.goals
    for insert with check (auth.uid() = user_id);

create policy "Users can update own goals" on public.goals
    for update using (auth.uid() = user_id);

create policy "Users can delete own goals" on public.goals
    for delete using (auth.uid() = user_id);

-- Income streams table
create table if not exists public.income_streams (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    source text,
    amount numeric not null,
    frequency text check (frequency in ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually', 'variable')),
    next_payment_date date,
    icon text,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on income_streams
alter table public.income_streams enable row level security;

-- Income streams policies
create policy "Users can view own income streams" on public.income_streams
    for select using (auth.uid() = user_id);

create policy "Users can insert own income streams" on public.income_streams
    for insert with check (auth.uid() = user_id);

create policy "Users can update own income streams" on public.income_streams
    for update using (auth.uid() = user_id);

create policy "Users can delete own income streams" on public.income_streams
    for delete using (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date desc);
create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_income_streams_user_id on public.income_streams(user_id);

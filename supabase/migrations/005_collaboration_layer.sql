-- MoneyLoop Migration: Collaboration Layer
-- Adds households, members, tasks, and finance contexts for multi-user collaboration

-- ============================================
-- 1. HOUSEHOLDS (Families/Teams/Organizations)
-- ============================================

create table if not exists public.households (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    invite_code text unique default encode(gen_random_bytes(6), 'base64'),
    created_by uuid references auth.users on delete set null,
    settings jsonb default '{"allowMemberInvites": false, "defaultMemberRole": "member"}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.households enable row level security;

-- ============================================
-- 2. HOUSEHOLD MEMBERS
-- ============================================

create table if not exists public.household_members (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references public.households on delete cascade not null,
    user_id uuid references auth.users on delete cascade not null,
    role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
    nickname text, -- Display name within household
    can_edit_tasks boolean default true,
    can_claim_tasks boolean default true,
    can_add_accounts boolean default false,
    can_view_all_transactions boolean default true,
    can_invite_members boolean default false,
    joined_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(household_id, user_id)
);

alter table public.household_members enable row level security;

-- ============================================
-- 3. FINANCE CONTEXTS (Personal/Business Separation)
-- ============================================

create table if not exists public.finance_contexts (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references public.households on delete cascade not null,
    name text not null, -- "Personal", "Business", "Rental Properties", etc.
    type text not null check (type in ('personal', 'business', 'investment', 'other')),
    is_default boolean default false,
    color text default '#7dd3a8',
    icon text default 'wallet',
    tax_separate boolean default false, -- Flag for tax prep separation
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.finance_contexts enable row level security;

-- ============================================
-- 4. COLLABORATIVE TASKS
-- ============================================

create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references public.households on delete cascade not null,
    context_id uuid references public.finance_contexts on delete set null,
    created_by uuid references auth.users not null,
    assigned_to uuid references auth.users,
    claimed_by uuid references auth.users,
    
    -- Task details
    title text not null,
    description text,
    type text not null check (type in ('bill', 'action', 'reminder', 'goal', 'tax', 'investment', 'property')),
    priority text default 'noise' check (priority in ('signal', 'noise')),
    
    -- Financial info (optional)
    amount decimal,
    currency text default 'USD',
    
    -- Scheduling
    due_date date,
    reminder_date date,
    recurrence text check (recurrence in ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
    
    -- Status tracking
    status text default 'open' check (status in ('open', 'claimed', 'in_progress', 'completed', 'cancelled')),
    claimed_at timestamptz,
    completed_at timestamptz,
    completion_notes text,
    
    -- Linked entities
    linked_bill_id uuid,
    linked_goal_id uuid references public.goals,
    linked_transaction_id uuid references public.transactions,
    
    -- Metadata
    tags text[] default '{}',
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

-- ============================================
-- 5. TASK ACTIVITY LOG
-- ============================================

create table if not exists public.task_activities (
    id uuid primary key default gen_random_uuid(),
    task_id uuid references public.tasks on delete cascade not null,
    user_id uuid references auth.users not null,
    action text not null check (action in ('created', 'claimed', 'unclaimed', 'completed', 'reopened', 'assigned', 'updated', 'commented')),
    details jsonb default '{}',
    created_at timestamptz default now()
);

alter table public.task_activities enable row level security;

-- ============================================
-- 6. HOUSEHOLD INVITATIONS
-- ============================================

create table if not exists public.household_invitations (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references public.households on delete cascade not null,
    invited_by uuid references auth.users not null,
    email text not null,
    role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
    token text unique default encode(gen_random_bytes(16), 'hex'),
    status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
    expires_at timestamptz default (now() + interval '7 days'),
    created_at timestamptz default now()
);

alter table public.household_invitations enable row level security;

-- ============================================
-- 7. ADD COLUMNS TO EXISTING TABLES
-- ============================================

-- Add household_id and context_id to accounts
alter table public.accounts 
    add column if not exists household_id uuid references public.households,
    add column if not exists context_id uuid references public.finance_contexts;

-- Add household_id and context_id to transactions
alter table public.transactions 
    add column if not exists household_id uuid references public.households,
    add column if not exists context_id uuid references public.finance_contexts;

-- Add household_id and context_id to goals
alter table public.goals 
    add column if not exists household_id uuid references public.households,
    add column if not exists context_id uuid references public.finance_contexts;

-- Add household_id and context_id to income_streams
alter table public.income_streams 
    add column if not exists household_id uuid references public.households,
    add column if not exists context_id uuid references public.finance_contexts;

-- ============================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Helper function: Check if user is member of household
create or replace function public.is_household_member(hh_id uuid)
returns boolean as $$
begin
    return exists (
        select 1 from public.household_members 
        where household_id = hh_id and user_id = auth.uid()
    );
end;
$$ language plpgsql security definer;

-- Helper function: Get user's household IDs
create or replace function public.user_household_ids()
returns setof uuid as $$
    select household_id from public.household_members where user_id = auth.uid();
$$ language sql security definer;

-- HOUSEHOLDS policies
create policy "Users can view their households" on public.households
    for select using (id in (select public.user_household_ids()));

create policy "Users can create households" on public.households
    for insert with check (auth.uid() = created_by);

create policy "Owners can update households" on public.households
    for update using (
        id in (
            select household_id from public.household_members 
            where user_id = auth.uid() and role = 'owner'
        )
    );

-- HOUSEHOLD_MEMBERS policies
create policy "Members can view household members" on public.household_members
    for select using (household_id in (select public.user_household_ids()));

create policy "Owners/admins can add members" on public.household_members
    for insert with check (
        household_id in (
            select household_id from public.household_members 
            where user_id = auth.uid() and role in ('owner', 'admin')
        )
    );

create policy "Members can update own record" on public.household_members
    for update using (user_id = auth.uid());

-- FINANCE_CONTEXTS policies
create policy "Members can view contexts" on public.finance_contexts
    for select using (household_id in (select public.user_household_ids()));

create policy "Owners/admins can manage contexts" on public.finance_contexts
    for all using (
        household_id in (
            select household_id from public.household_members 
            where user_id = auth.uid() and role in ('owner', 'admin')
        )
    );

-- TASKS policies
create policy "Members can view tasks" on public.tasks
    for select using (household_id in (select public.user_household_ids()));

create policy "Members can create tasks" on public.tasks
    for insert with check (
        household_id in (select public.user_household_ids())
        and created_by = auth.uid()
    );

create policy "Members can update tasks" on public.tasks
    for update using (
        household_id in (
            select hm.household_id from public.household_members hm
            where hm.user_id = auth.uid() and hm.can_edit_tasks = true
        )
    );

-- TASK_ACTIVITIES policies
create policy "Members can view activities" on public.task_activities
    for select using (
        task_id in (
            select t.id from public.tasks t
            where t.household_id in (select public.user_household_ids())
        )
    );

create policy "Members can log activities" on public.task_activities
    for insert with check (user_id = auth.uid());

-- INVITATIONS policies
create policy "Members can view invitations" on public.household_invitations
    for select using (household_id in (select public.user_household_ids()));

create policy "Admins can create invitations" on public.household_invitations
    for insert with check (
        household_id in (
            select household_id from public.household_members 
            where user_id = auth.uid() and (role in ('owner', 'admin') or can_invite_members = true)
        )
    );

-- Updated ACCOUNTS policy for household sharing
drop policy if exists "Users can view own accounts" on public.accounts;
create policy "Users can view accounts" on public.accounts
    for select using (
        auth.uid() = user_id 
        OR household_id in (select public.user_household_ids())
    );

-- Updated TRANSACTIONS policy for household sharing  
drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view transactions" on public.transactions
    for select using (
        auth.uid() = user_id 
        OR household_id in (select public.user_household_ids())
    );

-- Updated GOALS policy for household sharing
drop policy if exists "Users can view own goals" on public.goals;
create policy "Users can view goals" on public.goals
    for select using (
        auth.uid() = user_id 
        OR household_id in (select public.user_household_ids())
    );

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================

create index if not exists idx_household_members_user on public.household_members(user_id);
create index if not exists idx_household_members_household on public.household_members(household_id);
create index if not exists idx_tasks_household on public.tasks(household_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_claimed_by on public.tasks(claimed_by);
create index if not exists idx_task_activities_task on public.task_activities(task_id);
create index if not exists idx_finance_contexts_household on public.finance_contexts(household_id);
create index if not exists idx_accounts_household on public.accounts(household_id);
create index if not exists idx_transactions_household on public.transactions(household_id);

-- ============================================
-- 10. AUTO-CREATE HOUSEHOLD FOR NEW USERS
-- ============================================

create or replace function public.handle_new_user_household()
returns trigger as $$
declare
    new_household_id uuid;
    default_context_id uuid;
begin
    -- Create a personal household for the new user
    insert into public.households (name, created_by)
    values (
        coalesce(new.raw_user_meta_data->>'full_name', new.email) || '''s Finances',
        new.id
    )
    returning id into new_household_id;
    
    -- Add user as owner
    insert into public.household_members (household_id, user_id, role, can_add_accounts, can_invite_members)
    values (new_household_id, new.id, 'owner', true, true);
    
    -- Create default personal context
    insert into public.finance_contexts (household_id, name, type, is_default)
    values (new_household_id, 'Personal', 'personal', true)
    returning id into default_context_id;
    
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto-creating household
drop trigger if exists on_auth_user_created_household on auth.users;
create trigger on_auth_user_created_household
    after insert on auth.users
    for each row execute procedure public.handle_new_user_household();

-- ============================================
-- 11. UTILITY FUNCTIONS
-- ============================================

-- Function to claim a task
create or replace function public.claim_task(task_id uuid)
returns public.tasks as $$
declare
    result public.tasks;
begin
    update public.tasks 
    set 
        claimed_by = auth.uid(),
        claimed_at = now(),
        status = 'claimed',
        updated_at = now()
    where id = task_id 
        and household_id in (select public.user_household_ids())
        and status = 'open'
    returning * into result;
    
    -- Log activity
    if result.id is not null then
        insert into public.task_activities (task_id, user_id, action)
        values (task_id, auth.uid(), 'claimed');
    end if;
    
    return result;
end;
$$ language plpgsql security definer;

-- Function to complete a task
create or replace function public.complete_task(task_id uuid, notes text default null)
returns public.tasks as $$
declare
    result public.tasks;
begin
    update public.tasks 
    set 
        status = 'completed',
        completed_at = now(),
        completion_notes = notes,
        updated_at = now()
    where id = task_id 
        and household_id in (select public.user_household_ids())
        and status in ('open', 'claimed', 'in_progress')
    returning * into result;
    
    -- Log activity
    if result.id is not null then
        insert into public.task_activities (task_id, user_id, action, details)
        values (task_id, auth.uid(), 'completed', jsonb_build_object('notes', notes));
    end if;
    
    return result;
end;
$$ language plpgsql security definer;

-- Function to accept invitation
create or replace function public.accept_invitation(invite_token text)
returns public.household_members as $$
declare
    invite public.household_invitations;
    result public.household_members;
begin
    -- Get and validate invitation
    select * into invite from public.household_invitations
    where token = invite_token 
        and status = 'pending' 
        and expires_at > now();
    
    if invite.id is null then
        raise exception 'Invalid or expired invitation';
    end if;
    
    -- Add user to household
    insert into public.household_members (household_id, user_id, role)
    values (invite.household_id, auth.uid(), invite.role)
    on conflict (household_id, user_id) do nothing
    returning * into result;
    
    -- Mark invitation as accepted
    update public.household_invitations
    set status = 'accepted'
    where id = invite.id;
    
    return result;
end;
$$ language plpgsql security definer;

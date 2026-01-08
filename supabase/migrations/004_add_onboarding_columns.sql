-- Add onboarding status to profiles table
-- Run this in Supabase SQL Editor

-- Add onboarding_completed column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add onboarding_path column to track which path the user took
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_path text CHECK (onboarding_path IN ('ai_assisted', 'manual', 'skipped'));

-- Add monthly_income for quick reference
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_income numeric DEFAULT 0;

-- Add preferences JSONB for user settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- Update the handle_new_user function to include new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, onboarding_completed)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
        false
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow users to insert their own profile (needed for OAuth callback profile creation)
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

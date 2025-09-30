-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  email TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  total_invested_eth DECIMAL(18, 8) DEFAULT 0,
  total_invested_usd DECIMAL(18, 2) DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  banned BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'upcoming', 'ended', 'paused', 'rejected')),
  raised_amount DECIMAL(18, 2) DEFAULT 0,
  goal_amount DECIMAL(18, 2) NOT NULL,
  participants_count INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_address TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('investment', 'claim', 'refund', 'withdrawal')),
  from_address TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT,
  amount_crypto TEXT NOT NULL,
  amount_usd DECIMAL(18, 2),
  tx_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_analytics table for aggregated stats
CREATE TABLE IF NOT EXISTS public.platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL UNIQUE,
  total_raised_usd DECIMAL(18, 2) DEFAULT 0,
  total_volume_24h_usd DECIMAL(18, 2) DEFAULT 0,
  total_transactions_24h INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  active_users_today INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  pending_kyc INTEGER DEFAULT 0,
  new_users_30d INTEGER DEFAULT 0,
  investments_30d INTEGER DEFAULT 0,
  kyc_completed_30d INTEGER DEFAULT 0,
  platform_revenue_usd DECIMAL(18, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_activities table for activity feed
CREATE TABLE IF NOT EXISTS public.platform_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('kyc', 'project', 'investment', 'user', 'admin')),
  user_address TEXT,
  action_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'info', 'error')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kyc_submissions table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  selfie_verified BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON public.profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON public.profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON public.transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON public.transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_platform_activities_created_at ON public.platform_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_wallet ON public.kyc_submissions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (is_current_user_admin());

-- RLS Policies for projects
CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (is_current_user_admin());

-- RLS Policies for transactions
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (is_current_user_admin());

-- RLS Policies for platform_analytics
CREATE POLICY "Admins can view analytics"
  ON public.platform_analytics FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Admins can manage analytics"
  ON public.platform_analytics FOR ALL
  USING (is_current_user_admin());

-- RLS Policies for platform_activities
CREATE POLICY "Admins can view activities"
  ON public.platform_activities FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert activities"
  ON public.platform_activities FOR INSERT
  WITH CHECK (is_current_user_admin());

-- RLS Policies for kyc_submissions
CREATE POLICY "Admins can view all KYC submissions"
  ON public.kyc_submissions FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Admins can update KYC submissions"
  ON public.kyc_submissions FOR UPDATE
  USING (is_current_user_admin());

CREATE POLICY "Anyone can submit KYC"
  ON public.kyc_submissions FOR INSERT
  WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_submissions_updated_at
  BEFORE UPDATE ON public.kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_analytics_updated_at
  BEFORE UPDATE ON public.platform_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
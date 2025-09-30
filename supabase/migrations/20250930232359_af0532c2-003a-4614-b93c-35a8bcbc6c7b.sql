-- Add tables for priority queue, webhooks, and distribution jobs

-- Webhook events table for audit trail
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  signature TEXT,
  status TEXT DEFAULT 'pending', -- pending, processed, failed
  retries INTEGER DEFAULT 0,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Priority whitelist for queue access
CREATE TABLE IF NOT EXISTS public.priority_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  reason TEXT, -- 'og_supporter', 'nft_holder', 'staker', etc.
  added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wallet_address, project_id)
);

-- Queue tickets for FCFS access
CREATE TABLE IF NOT EXISTS public.queue_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  priority BOOLEAN DEFAULT false,
  position INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting', -- waiting, active, expired, completed
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Distribution jobs for batch token distribution
CREATE TABLE IF NOT EXISTS public.distribution_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  total_batches INTEGER NOT NULL,
  completed_batches INTEGER DEFAULT 0,
  total_recipients INTEGER NOT NULL,
  total_tokens NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
  batches JSONB NOT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity KYC for institutional investors
CREATE TABLE IF NOT EXISTS public.entity_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'fund', 'company', 'dao', etc.
  wallet_address TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  registration_number TEXT,
  jurisdiction TEXT NOT NULL,
  documents JSONB, -- array of document URLs/references
  compliance_notes TEXT,
  status TEXT DEFAULT 'pending', -- pending, under_review, approved, rejected
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  risk_level TEXT DEFAULT 'medium', -- low, medium, high
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rate limiting table for security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'purchase', 'kyc_submit', 'queue_join'
  project_id UUID,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wallet_address, action_type, project_id)
);

-- Anomaly detection logs
CREATE TABLE IF NOT EXISTS public.anomaly_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT,
  anomaly_type TEXT NOT NULL, -- 'rapid_purchases', 'suspicious_pattern', 'geo_mismatch'
  severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  details JSONB NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_priority_whitelist_wallet ON public.priority_whitelist(wallet_address);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_project ON public.queue_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_wallet ON public.queue_tickets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_status ON public.queue_tickets(status);
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_project ON public.distribution_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_status ON public.distribution_jobs(status);
CREATE INDEX IF NOT EXISTS idx_entity_kyc_wallet ON public.entity_kyc(wallet_address);
CREATE INDEX IF NOT EXISTS idx_entity_kyc_status ON public.entity_kyc(status);
CREATE INDEX IF NOT EXISTS idx_rate_limits_wallet ON public.rate_limits(wallet_address);
CREATE INDEX IF NOT EXISTS idx_anomaly_logs_wallet ON public.anomaly_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_anomaly_logs_resolved ON public.anomaly_logs(resolved);

-- Enable RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priority_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view webhook events"
ON public.webhook_events FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Anyone can view priority whitelist"
ON public.priority_whitelist FOR SELECT
USING (true);

CREATE POLICY "Admins can manage whitelist"
ON public.priority_whitelist FOR ALL
USING (is_current_user_admin());

CREATE POLICY "Users can view their own tickets"
ON public.queue_tickets FOR SELECT
USING (true);

CREATE POLICY "Anyone can create tickets"
ON public.queue_tickets FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their tickets"
ON public.queue_tickets FOR UPDATE
USING (true);

CREATE POLICY "Admins can view distribution jobs"
ON public.distribution_jobs FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Admins can manage distribution jobs"
ON public.distribution_jobs FOR ALL
USING (is_current_user_admin());

CREATE POLICY "Anyone can submit entity KYC"
ON public.entity_kyc FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their entity KYC"
ON public.entity_kyc FOR SELECT
USING (true);

CREATE POLICY "Admins can manage entity KYC"
ON public.entity_kyc FOR ALL
USING (is_current_user_admin());

CREATE POLICY "Anyone can check rate limits"
ON public.rate_limits FOR SELECT
USING (true);

CREATE POLICY "Anyone can update rate limits"
ON public.rate_limits FOR ALL
USING (true);

CREATE POLICY "Admins can view anomaly logs"
ON public.anomaly_logs FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "System can create anomaly logs"
ON public.anomaly_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update anomaly logs"
ON public.anomaly_logs FOR UPDATE
USING (is_current_user_admin());

-- Update triggers
CREATE TRIGGER update_queue_tickets_updated_at
BEFORE UPDATE ON public.queue_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_distribution_jobs_updated_at
BEFORE UPDATE ON public.distribution_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entity_kyc_updated_at
BEFORE UPDATE ON public.entity_kyc
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
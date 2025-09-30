import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  wallet_address: string;
  email: string | null;
  kyc_status: string;
  total_invested_eth: number;
  total_invested_usd: number;
  projects_count: number;
  banned: boolean;
  joined_at: string;
  last_active_at: string;
}

export interface Project {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  status: string;
  raised_amount: number;
  goal_amount: number;
  participants_count: number;
  progress_percentage: number;
  start_date: string;
  end_date: string;
  contract_address: string | null;
  created_by: string | null;
}

export interface Transaction {
  id: string;
  transaction_type: string;
  from_address: string;
  project_id: string | null;
  project_name: string | null;
  amount_crypto: string;
  amount_usd: number | null;
  tx_hash: string;
  status: string;
  timestamp: string;
}

export interface PlatformAnalytics {
  id: string;
  metric_date: string;
  total_raised_usd: number;
  total_volume_24h_usd: number;
  total_transactions_24h: number;
  total_users: number;
  active_users_today: number;
  active_projects: number;
  pending_kyc: number;
  new_users_30d: number;
  investments_30d: number;
  kyc_completed_30d: number;
  platform_revenue_usd: number;
}

export interface PlatformActivity {
  id: string;
  activity_type: string;
  user_address: string | null;
  action_text: string;
  status: string;
  metadata: any;
  created_at: string;
}

export interface KYCSubmission {
  id: string;
  wallet_address: string;
  full_name: string;
  email: string;
  country: string;
  document_type: string;
  document_number: string;
  selfie_verified: boolean;
  status: string;
  risk_level: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return { profiles, loading, error, refetch: fetchProfiles };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return { transactions, loading, error, refetch: fetchTransactions };
}

export function usePlatformAnalytics() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_analytics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setAnalytics(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

export function usePlatformActivities(limit: number = 10) {
  const [activities, setActivities] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivities(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  return { activities, loading, error, refetch: fetchActivities };
}

export function useKYCSubmissions() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching KYC submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return { submissions, loading, error, refetch: fetchSubmissions };
}

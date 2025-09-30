import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

export interface UserInvestment {
  id: string;
  project_id: string;
  project_name: string;
  project_symbol: string;
  amount_eth: number;
  amount_usd: number;
  tokens_received: number;
  status: string;
  created_at: string;
}

export interface UserTransaction {
  id: string;
  transaction_type: string;
  project_name: string;
  amount_crypto: string;
  amount_usd: number;
  status: string;
  timestamp: string;
  tx_hash: string;
}

export function useUserInvestments() {
  const { address } = useAccount();
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestments = async () => {
    if (!address) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_investments')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments((data as any) || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [address]);

  return { investments, loading, error, refetch: fetchInvestments };
}

export function useUserTransactions() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!address) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('from_address', address)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions((data as any) || []);
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
  }, [address]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

export function useUserKYC() {
  const { address } = useAccount();
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  const fetchKYCStatus = async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select('status')
        .eq('wallet_address', address)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setKycStatus(data?.status || 'not_submitted');
    } catch (err: any) {
      console.error('Error fetching KYC status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCStatus();
  }, [address]);

  return { kycStatus, loading, refetch: fetchKYCStatus };
}
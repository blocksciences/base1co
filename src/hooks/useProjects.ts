import { useQuery } from '@tanstack/react-query';
import type { Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // Fetch from database
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      // Return empty array if no projects, don't fall back to mock data
      if (!data || data.length === 0) {
        return [];
      }
      
      // Transform database projects to match Project type
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        symbol: p.symbol,
        description: p.description || 'No description available',
        logo: `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop`,
        raised: Number(p.raised_amount || 0),
        goal: Number(p.goal_amount || 1),
        hardCap: Number(p.hard_cap || p.goal_amount || 1),
        softCap: Number(p.soft_cap || 0),
        minContribution: Number(p.min_contribution || 0.01),
        maxContribution: Number(p.max_contribution || 10),
        participants: p.participants_count || 0,
        price: '0.05 ETH', // Calculate from tokenomics if available
        status: p.status as 'upcoming' | 'live' | 'ended' | 'success',
        endsIn: calculateTimeRemaining(p.end_date),
        endDate: p.end_date ? new Date(p.end_date) : undefined,
        network: 'Base',
        contractAddress: p.contract_address || '0x0000000000000000000000000000000000000000',
        socialLinks: {
          website: undefined,
          twitter: undefined,
          telegram: undefined,
          discord: undefined,
          medium: undefined,
          whitepaper: undefined,
        },
      }));
    },
    staleTime: 30000, // 30 seconds
  });
};

function calculateTimeRemaining(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${days}d ${hours}h`;
}

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      // Try fetching from database
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching project:', error);
        return null;
      }
      
      // If found in database, transform and return
      if (data) {
        return {
          id: data.id,
          name: data.name,
          symbol: data.symbol,
          description: data.description || 'No description available',
          logo: `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop`,
          raised: Number(data.raised_amount || 0),
          goal: Number(data.goal_amount || 1),
          hardCap: Number(data.hard_cap || data.goal_amount || 1),
          softCap: Number(data.soft_cap || 0),
          minContribution: Number(data.min_contribution || 0.01),
          maxContribution: Number(data.max_contribution || 10),
          participants: data.participants_count || 0,
          price: '0.05 ETH',
          status: data.status as 'upcoming' | 'live' | 'ended' | 'success',
          endsIn: calculateTimeRemaining(data.end_date),
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          network: 'Base',
          contractAddress: data.contract_address || '0x0000000000000000000000000000000000000000',
          socialLinks: {
            website: undefined,
            twitter: undefined,
            telegram: undefined,
            discord: undefined,
            medium: undefined,
            whitepaper: undefined,
          },
        };
      }
      
      // Return null if not found
      return null;
    },
    enabled: !!id,
  });
};

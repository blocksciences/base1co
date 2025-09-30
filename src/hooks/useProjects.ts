import { useQuery } from '@tanstack/react-query';
import type { Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

// Mock data for now - in production, this would fetch from smart contracts
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'DeFi Protocol X',
    symbol: 'DPX',
    description: 'Next-generation DeFi protocol enabling cross-chain liquidity aggregation with AI-powered yield optimization.',
    logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop',
    raised: 1250,
    goal: 2000,
    participants: 3421,
    price: '0.05 ETH',
    status: 'live',
    endsIn: '5d 12h',
    network: 'Base',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  },
  {
    id: '2',
    name: 'GameFi Universe',
    symbol: 'GFU',
    description: 'Revolutionary blockchain gaming platform with play-to-earn mechanics and NFT marketplace integration.',
    logo: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=100&h=100&fit=crop',
    raised: 3800,
    goal: 5000,
    participants: 8921,
    price: '0.03 ETH',
    status: 'live',
    endsIn: '2d 8h',
    network: 'Base',
    contractAddress: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
  },
  {
    id: '3',
    name: 'MetaAI Network',
    symbol: 'MAI',
    description: 'Decentralized AI compute network powered by blockchain technology for machine learning tasks.',
    logo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
    raised: 890,
    goal: 1500,
    participants: 2156,
    price: '0.08 ETH',
    status: 'live',
    endsIn: '8d 16h',
    network: 'Base',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  {
    id: '4',
    name: 'SocialChain',
    symbol: 'SCH',
    description: 'Web3 social media platform with tokenized content creation and decentralized governance.',
    logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop',
    raised: 5200,
    goal: 5000,
    participants: 15430,
    price: '0.02 ETH',
    status: 'success',
    endsIn: 'Completed',
    network: 'Base',
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  {
    id: '5',
    name: 'EcoToken',
    symbol: 'ECO',
    description: 'Carbon credit marketplace built on blockchain for transparent environmental impact tracking.',
    logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop',
    raised: 0,
    goal: 3000,
    participants: 0,
    price: '0.06 ETH',
    status: 'upcoming',
    endsIn: 'Starts in 3d',
    network: 'Base',
    contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  },
  {
    id: '6',
    name: 'HealthDAO',
    symbol: 'HDAO',
    description: 'Decentralized healthcare data platform enabling secure patient data sharing and medical research.',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop',
    raised: 2100,
    goal: 4000,
    participants: 5234,
    price: '0.04 ETH',
    status: 'live',
    endsIn: '10d 4h',
    network: 'Base',
    contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
];

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // Fetch from database first, fall back to mock data
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        return MOCK_PROJECTS;
      }
      
      // If database is empty, return mock projects
      if (!data || data.length === 0) {
        return MOCK_PROJECTS;
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
        participants: p.participants_count || 0,
        price: '0.05 ETH', // Calculate from tokenomics if available
        status: p.status as 'upcoming' | 'live' | 'ended' | 'success',
        endsIn: calculateTimeRemaining(p.end_date),
        network: 'Base',
        contractAddress: p.contract_address || '0x0000000000000000000000000000000000000000',
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
      // Try fetching from database first
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching project:', error);
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
          participants: data.participants_count || 0,
          price: '0.05 ETH',
          status: data.status as 'upcoming' | 'live' | 'ended' | 'success',
          endsIn: calculateTimeRemaining(data.end_date),
          network: 'Base',
          contractAddress: data.contract_address || '0x0000000000000000000000000000000000000000',
        };
      }
      
      // Fall back to mock projects
      return MOCK_PROJECTS.find(p => p.id === id);
    },
    enabled: !!id,
  });
};

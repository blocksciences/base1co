import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import type { Project } from '@/types/project';

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
  const publicClient = usePublicClient();
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // In production, fetch real data from smart contracts using publicClient
      // For now, return mock data
      return MOCK_PROJECTS;
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useProject = (id: string) => {
  const publicClient = usePublicClient();
  
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      // In production, fetch real data from smart contract
      return MOCK_PROJECTS.find(p => p.id === id);
    },
    enabled: !!id,
  });
};

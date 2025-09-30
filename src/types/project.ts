// TypeScript types for the ICO platform

export interface Project {
  id: string;
  name: string;
  symbol: string;
  description: string;
  logo: string;
  raised: number;
  goal: number;
  participants: number;
  price: string;
  status: 'upcoming' | 'live' | 'ended' | 'success';
  endsIn: string;
  network: string;
  contractAddress: string;
  tokenAddress?: string;
  startDate?: Date;
  endDate?: Date;
  minContribution?: number;
  maxContribution?: number;
  vestingSchedule?: {
    cliff: number; // in days
    duration: number; // in days
    percentage: number;
  }[];
  teamInfo?: {
    name: string;
    role: string;
    image: string;
    linkedin?: string;
    twitter?: string;
  }[];
  socialLinks?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    medium?: string;
  };
  tokenomics?: {
    totalSupply: number;
    publicSale: number;
    team: number;
    ecosystem: number;
    liquidity: number;
  };
  auditReports?: {
    auditor: string;
    date: Date;
    reportUrl: string;
  }[];
}

export interface Investment {
  id: string;
  projectId: string;
  projectName: string;
  projectSymbol: string;
  amount: number;
  tokenAmount: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'claimed';
  txHash: string;
}

export interface Transaction {
  id: string;
  type: 'invest' | 'claim' | 'stake' | 'unstake';
  projectId?: string;
  projectName?: string;
  amount: string;
  tokenAmount?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
}

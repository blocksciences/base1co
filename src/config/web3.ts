import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ICO Launch Platform',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Users need to get this from WalletConnect
  chains: [base, baseSepolia],
  ssr: false,
});

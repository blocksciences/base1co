# LaunchBase - Setup Instructions

## Getting Started

This ICO platform is built on **Base network** with Web3 wallet integration.

### Required Configuration

#### 1. WalletConnect Project ID

To enable wallet connections, you need to get a free WalletConnect Project ID:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up for a free account
3. Create a new project
4. Copy your Project ID
5. Replace `YOUR_WALLETCONNECT_PROJECT_ID` in `src/config/web3.ts` with your actual Project ID

```typescript
// src/config/web3.ts
export const config = getDefaultConfig({
  appName: 'ICO Launch Platform',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace this!
  chains: [base, baseSepolia],
  ssr: false,
});
```

### Supported Wallets

The platform automatically supports multiple wallet providers:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- And many more...

### Network Configuration

The platform is configured for:
- **Base Mainnet** (Production)
- **Base Sepolia** (Testing)

### Features

✅ Multi-wallet Web3 authentication
✅ Browse live ICO projects
✅ Real-time blockchain data
✅ Investment dashboard
✅ Token staking
✅ Modern crypto UI theme

### Development

```bash
npm install
npm run dev
```

### Notes

- All project data currently uses mock data for demonstration
- To connect to real smart contracts, implement the contract calls in `src/hooks/useProjects.ts`
- Smart contract addresses should be configured for each project
- Ensure you're connected to the correct network (Base) before investing

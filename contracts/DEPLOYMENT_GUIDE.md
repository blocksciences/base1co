# ICO Contract Deployment Guide

This guide explains how to deploy your ICO contracts to the blockchain after creating an ICO project through the admin panel.

## Two-Step Deployment Process

### Step 1: Create ICO in Admin Panel ✅
Use the "Create ICO" button in the admin panel to:
- Configure your ICO parameters (name, symbol, caps, dates, etc.)
- Create the project record in the database
- Generate placeholder contract addresses

### Step 2: Deploy Real Contracts 🚀
Follow the steps below to deploy actual smart contracts to Base Sepolia (testnet) or Base (mainnet).

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd contracts
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the `/contracts` folder:
   ```env
   # Your deployer wallet private key (DO NOT COMMIT THIS!)
   PRIVATE_KEY=your_private_key_here
   
   # RPC URLs
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASE_RPC_URL=https://mainnet.base.org
   
   # Optional: For contract verification on BaseScan
   BASESCAN_API_KEY=your_basescan_api_key
   ```

3. **Fund Your Deployer Wallet**
   - For Base Sepolia: Get testnet ETH from [Base Sepolia Faucet](https://bridge.base.org) or [Alchemy](https://www.alchemy.com/faucets/base-sepolia)
   - For Base Mainnet: You'll need real ETH

## Deployment Commands

### Deploy to Base Sepolia (Testnet)

```bash
cd contracts

# Set your ICO parameters
export TOKEN_NAME="Your Token Name"
export TOKEN_SYMBOL="SYMBOL"
export INITIAL_SUPPLY="1000000000"
export TOKEN_DECIMALS="18"
export TOKEN_PRICE="0.001"
export SOFT_CAP="100"
export HARD_CAP="1000"
export MIN_CONTRIBUTION="0.1"
export MAX_CONTRIBUTION="100"

# Deploy contracts
npx hardhat run scripts/deploy-ico.ts --network baseSepolia
```

### Deploy to Base Mainnet (Production)

```bash
cd contracts

# Set your ICO parameters (same as above)
export TOKEN_NAME="Your Token Name"
# ... (set all parameters)

# Deploy contracts
npx hardhat run scripts/deploy-ico.ts --network base
```

## After Deployment

1. **Save Contract Addresses**
   The deployment script will output something like:
   ```
   Token Address: 0x1234...
   Sale Address: 0x5678...
   ```
   
2. **Update Database**
   You need to update your ICO project with the real contract addresses. This can be done via:
   
   **Option A: Admin API Call**
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/update-contract-addresses \
     -H "Content-Type: application/json" \
     -H "apikey: YOUR_SUPABASE_ANON_KEY" \
     -d '{
       "projectId": "your-project-uuid",
       "tokenAddress": "0x1234...",
       "saleAddress": "0x5678...",
       "deployerAddress": "your-wallet-address"
     }'
   ```
   
   **Option B: Direct Database Update**
   Update the `projects` table directly in your database:
   ```sql
   UPDATE projects 
   SET contract_address = '0x5678...'  -- Sale contract address
   WHERE id = 'your-project-uuid';
   ```

3. **Verify Contracts on BaseScan** (Optional)
   The deployment script will output verification commands. Run them to verify your contracts:
   ```bash
   npx hardhat verify --network baseSepolia <TOKEN_ADDRESS> "Token Name" "SYMBOL" 1000000000 18
   npx hardhat verify --network baseSepolia <SALE_ADDRESS> <TOKEN_ADDRESS> ...
   ```

## Deployment Architecture

```
Admin Panel (Frontend)
    ↓
Create ICO (Edge Function)
    ↓
Database Record Created
    ↓
Hardhat Deployment (CLI)
    ↓
Real Contracts on Blockchain
    ↓
Update Contract Addresses (Edge Function or Direct DB)
    ↓
ICO is Live! 🎉
```

## Troubleshooting

### "Insufficient funds for gas"
- Make sure your deployer wallet has enough ETH
- For testnet, get ETH from faucets

### "Nonce too high"
- Reset your account: `npx hardhat clean`
- Or specify nonce manually in hardhat.config.ts

### "Contract verification failed"
- Make sure you're using the exact constructor parameters from deployment
- Wait a few minutes after deployment before verifying

## Security Best Practices

1. **Never commit your private key**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Test on Sepolia first**
   - Always test on testnet before mainnet
   - Verify all functionality works

3. **Audit your contracts**
   - For mainnet deployments, consider a professional audit
   - Test thoroughly with different scenarios

4. **Use multi-sig for admin operations**
   - Consider using a multi-signature wallet for owner operations
   - This adds an extra layer of security

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify your environment variables
3. Ensure sufficient gas/ETH in deployer wallet
4. Check BaseScan for transaction details

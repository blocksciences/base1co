# ICO Launchpad Setup Guide

This guide explains how to set up the ICO deployment system properly using the factory pattern.

## Overview

The platform uses a **Factory Pattern** where:
1. **ICOLaunchpad** (factory) is deployed ONCE
2. All ICOs are deployed THROUGH the launchpad
3. The edge function calls the launchpad to deploy new ICOs

This is the proper architecture for an ICO platform!

## One-Time Setup (Deploy the Launchpad Factory)

### Step 1: Fund Your Deployer Wallet

Get Base Sepolia ETH from:
- [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia) (Recommended - 0.1 ETH)
- [QuickNode Faucet](https://faucet.quicknode.com/base/sepolia)
- Bridge from Sepolia: Get Sepolia ETH → Bridge to Base Sepolia at [bridge.base.org](https://bridge.base.org)

Your deployer wallet: Check `DEPLOYER_PRIVATE_KEY` secret

### Step 2: Deploy the ICOLaunchpad Factory

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy the launchpad factory to Base Sepolia
npx hardhat run scripts/deploy-launchpad.ts --network baseSepolia
```

You'll see output like:
```
✅ ICOLaunchpad deployed to: 0x1234...5678

⚠️  IMPORTANT: Save this launchpad address to your Supabase secrets:
Secret Name: ICO_LAUNCHPAD_ADDRESS
Secret Value: 0x1234...5678
```

### Step 3: Add Launchpad Address to Secrets

1. Copy the launchpad address from the deployment output
2. Go to your Lovable project settings
3. Add a new secret:
   - Name: `ICO_LAUNCHPAD_ADDRESS`
   - Value: `0x1234...5678` (your actual address)

### Step 4: Verify the Contract (Optional but Recommended)

```bash
npx hardhat verify --network baseSepolia 0x1234...5678
```

## Usage (Creating ICOs)

Once the launchpad is deployed and the address is in secrets, you can:

### Option 1: Via Admin Panel (Easiest)
1. Go to Admin Dashboard → Create ICO
2. Fill in the ICO details
3. Click "Deploy Contracts"
4. Wait for blockchain confirmation (~5-10 seconds)
5. Done! All contracts deployed ✅

### Option 2: Via API
```bash
curl -X POST https://your-project.supabase.co/functions/v1/deploy-ico-contracts \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "projectName": "My Token",
    "tokenSymbol": "MTK",
    "totalSupply": "1000000000",
    "tokenDecimals": 18,
    "tokenPrice": "0.001",
    "softCap": "100",
    "hardCap": "1000",
    "minContribution": "0.1",
    "maxContribution": "100",
    "startDate": "2025-10-10T10:00:00",
    "endDate": "2025-11-10T10:00:00",
    "deployerAddress": "0xYourAdminWallet"
  }'
```

## What Gets Deployed Per ICO

Each ICO deployment creates 5 contracts:
1. **ICOToken** - The ERC20 token
2. **ICOSale** - The sale contract (handles purchases)
3. **KYCRegistry** - KYC/compliance tracking
4. **VestingVault** - Token vesting for team/advisors
5. **LiquidityLocker** - Locks liquidity for a period

All deployed through a single transaction!

## Architecture Diagram

```
User (Admin Panel)
    ↓
Edge Function (deploy-ico-contracts)
    ↓
ICOLaunchpad (Factory Contract)
    ↓
Deploys 5 Contracts:
├── ICOToken
├── ICOSale
├── KYCRegistry  
├── VestingVault
└── LiquidityLocker
    ↓
Database Updated with Addresses
    ↓
ICO is Live! 🎉
```

## Costs

### One-Time (Launchpad Deployment)
- Gas: ~0.05-0.1 Base Sepolia ETH (testnet)
- Gas: ~0.1-0.2 ETH on Base mainnet

### Per ICO Deployment
- Gas: ~0.01-0.02 Base Sepolia ETH (testnet)
- Gas: ~0.02-0.05 ETH on Base mainnet

## Troubleshooting

### "ICO_LAUNCHPAD_ADDRESS not configured"
→ You forgot Step 3. Add the launchpad address to Supabase secrets.

### "Deployer wallet has no ETH"
→ Fund your deployer wallet from the faucets listed in Step 1.

### "Only admin wallets can deploy"
→ Make sure your wallet address is in the `admin_wallets` table.

### "Transaction failed"
→ Check the transaction on [BaseScan](https://sepolia.basescan.org) using the tx hash from the error.

## Mainnet Deployment

When ready for production:

1. **Deploy launchpad to Base mainnet:**
   ```bash
   npx hardhat run scripts/deploy-launchpad.ts --network base
   ```

2. **Update the secret:**
   - Update `ICO_LAUNCHPAD_ADDRESS` with the mainnet address
   - Update `BASE_SEPOLIA_RPC_URL` to Base mainnet RPC

3. **Fund with real ETH**

4. **Test with a small ICO first!**

## Security Notes

- ✅ Launchpad factory is ownable (only you can update settings)
- ✅ All ICO contracts have proper access controls
- ✅ KYC registry prevents non-verified users from participating
- ✅ Admin operations require wallet signature
- ⚠️ Always test on testnet first
- ⚠️ Consider a professional audit before mainnet launch

## Support

If you encounter issues:
1. Check the edge function logs in your Lovable backend
2. Check the transaction on BaseScan
3. Verify all secrets are configured correctly
4. Make sure your wallet has enough gas

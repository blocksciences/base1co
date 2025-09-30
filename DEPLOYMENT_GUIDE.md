# ICO Smart Contract Deployment Guide

This guide explains how to deploy ICO smart contracts to Base network using the platform.

## Overview

The platform provides:
1. **Smart Contracts**: Production-ready Solidity contracts for ERC20 tokens and ICO sales
2. **Deployment Scripts**: Automated deployment using Hardhat
3. **Web Interface**: Create and deploy ICOs through the admin panel

## Contract Architecture

### ICOToken.sol
- **Type**: ERC20 Token with additional features
- **Features**:
  - Standard ERC20 functionality (transfer, approve, etc.)
  - Pausable (owner can pause/unpause transfers)
  - Burnable (users can burn their tokens)
  - Configurable decimals
  - Owner controls

### ICOSale.sol
- **Type**: ICO Sale Contract
- **Features**:
  - Soft cap and hard cap
  - Min/max contribution limits per user
  - Time-based sale periods (start/end dates)
  - Automatic refunds if soft cap not reached
  - Owner can finalize sale and withdraw funds
  - Pausable functionality
  - Extendable sale period

## Deployment Methods

### Method 1: Platform-Assisted Deployment (Recommended for Beginners)

1. **Navigate to Admin Panel**
   - Go to `/admin/create-ico`
   - Fill in all project details

2. **Click "Deploy Contracts"**
   - The system will validate your parameters
   - Generate deployment instructions
   - Create a project record in the database

3. **Follow the Instructions**
   - Install Hardhat dependencies
   - Set up your environment variables
   - Run the deployment script
   - Copy contract addresses back to the platform

### Method 2: Manual Deployment (Advanced Users)

#### Prerequisites
```bash
# Node.js v18 or higher
node --version

# Install dependencies
cd contracts
npm install
```

#### Environment Setup

Create `contracts/.env`:
```env
# CRITICAL: Never commit this file!
PRIVATE_KEY=your_wallet_private_key_here

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Optional: For contract verification
BASESCAN_API_KEY=your_basescan_api_key

# Deployment Parameters (optional - can override in script)
TOKEN_NAME="My ICO Token"
TOKEN_SYMBOL="MICO"
INITIAL_SUPPLY=1000000000
TOKEN_DECIMALS=18
TOKEN_PRICE=0.0001
SOFT_CAP=1000
HARD_CAP=5000
MIN_CONTRIBUTION=0.1
MAX_CONTRIBUTION=100
```

#### Compile Contracts

```bash
cd contracts
npx hardhat compile
```

#### Deploy to Testnet (Base Sepolia)

```bash
npx hardhat run scripts/deploy-ico.ts --network baseSepolia
```

#### Deploy to Mainnet (Base)

```bash
# Make sure you have enough ETH for gas!
npx hardhat run scripts/deploy-ico.ts --network base
```

#### Verify Contracts

After deployment, verify on BaseScan:

```bash
# Token contract
npx hardhat verify --network baseSepolia <TOKEN_ADDRESS> "Token Name" "SYMBOL" 1000000000 18

# Sale contract
npx hardhat verify --network baseSepolia <SALE_ADDRESS> <TOKEN_ADDRESS> <TOKEN_PRICE> <SOFT_CAP> <HARD_CAP> <MIN_CONTRIBUTION> <MAX_CONTRIBUTION> <START_TIME> <END_TIME>
```

## Gas Costs Estimate

Approximate costs on Base network:

| Operation | Gas Units | Cost @ 0.05 Gwei |
|-----------|-----------|------------------|
| Deploy Token | ~2,000,000 | ~$0.20 |
| Deploy Sale | ~3,000,000 | ~$0.30 |
| Transfer Tokens | ~50,000 | ~$0.005 |
| User Investment | ~100,000 | ~$0.01 |

*Costs vary based on network congestion and gas prices*

## Post-Deployment

### 1. Transfer Tokens to Sale Contract

The deployment script automatically transfers 40% of tokens to the sale contract. To transfer a different amount:

```javascript
// In your deployment script or console
const amount = ethers.parseUnits("400000000", 18); // 400M tokens
await token.transfer(saleAddress, amount);
```

### 2. Update Platform with Contract Addresses

In the admin panel:
- Paste Token Contract Address
- Paste Sale Contract Address
- Save the ICO project

### 3. Test the Sale

Before going live:
- Test with small amounts on testnet
- Verify soft cap/hard cap logic
- Test contribution limits
- Test refund mechanism (if soft cap not reached)
- Test token claiming

## Security Best Practices

### 🔒 Critical Security Measures

1. **Private Key Security**
   - NEVER commit `.env` files
   - Use hardware wallets for mainnet
   - Consider multi-sig wallets for owner functions

2. **Contract Auditing**
   - Get contracts audited before mainnet deployment
   - Use reputable auditing firms
   - Budget $5k-$50k for professional audits

3. **Testing**
   - Write comprehensive unit tests
   - Test on testnet extensively
   - Perform load testing
   - Have beta users test before public launch

4. **Access Control**
   - Use multi-sig for owner functions
   - Implement timelock for critical operations
   - Document all admin capabilities

5. **Monitoring**
   - Set up blockchain monitoring
   - Track all large transactions
   - Monitor for suspicious activity

## Contract Interactions

### For Users (Investing)

```javascript
// Connect wallet and invest
const saleContract = new ethers.Contract(saleAddress, ICOSaleABI, signer);
const amount = ethers.parseEther("1.0"); // 1 ETH
await saleContract.buyTokens({ value: amount });
```

### For Owner (Managing Sale)

```javascript
// Finalize sale (after end time and soft cap reached)
await saleContract.finalizeSale();

// Withdraw unsold tokens
await saleContract.withdrawUnsoldTokens();

// Extend sale if needed
const newEndTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // +7 days
await saleContract.extendSale(newEndTime);

// Pause in emergency
await saleContract.pause();
await saleContract.unpause();
```

### For Users (Getting Refunds)

```javascript
// If soft cap not reached, users can claim refunds
await saleContract.claimRefund();
```

## Troubleshooting

### Common Issues

**"Insufficient funds"**
- Ensure deployer wallet has enough ETH for gas
- Base Sepolia: Get testnet ETH from faucet
- Base Mainnet: Bridge ETH from Ethereum

**"Transaction reverted"**
- Check all contract parameters are valid
- Ensure start time is in the future
- Verify soft cap < hard cap

**"Contract not verified"**
- Check API key is correct
- Ensure constructor arguments match deployment
- Try flattening contract if using imports

**"Sale not started"**
- Current time must be >= start time
- Check timezone conversions

**"Hard cap reached"**
- Sale automatically stops when hard cap is reached
- Owner should finalize the sale

## Support Resources

- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts
- Hardhat Documentation: https://hardhat.org/docs
- Base Network Docs: https://docs.base.org
- Solidity Docs: https://docs.soliditylang.org

## Compliance & Legal

⚠️ **Important**: Conducting an ICO may have legal and regulatory implications:

1. Consult with legal counsel before launching
2. Understand securities laws in your jurisdiction
3. Implement KYC/AML if required
4. Consider geographic restrictions
5. Prepare proper disclosures and documentation

## Emergency Procedures

### If Vulnerability Discovered

1. **Immediately pause the contract**
   ```javascript
   await saleContract.pause();
   await token.pause();
   ```

2. **Notify users through all channels**
3. **Assess the situation with security experts**
4. **Prepare migration plan if needed**
5. **Consider bug bounty for responsible disclosure**

### If Owner Key Compromised

1. **Transfer ownership immediately** (if still possible)
2. **Pause all contracts**
3. **Alert users**
4. **Forensics to understand breach**
5. **Plan recovery strategy**

## Checklist Before Mainnet Launch

- [ ] Contracts compiled without errors
- [ ] Unit tests written and passing
- [ ] Deployed to testnet successfully
- [ ] Tested all user flows on testnet
- [ ] Security audit completed
- [ ] Legal review completed
- [ ] Marketing materials prepared
- [ ] KYC/AML system in place (if required)
- [ ] Emergency procedures documented
- [ ] Team trained on contract management
- [ ] Multi-sig wallet set up for owner functions
- [ ] Monitoring systems configured
- [ ] Sufficient ETH for gas in deployer wallet
- [ ] All environment variables secured
- [ ] Backup of deployment info

## Next Steps

After successful deployment:

1. **Marketing**: Announce your ICO
2. **Community**: Build your community on social media
3. **Support**: Provide user support channels
4. **Monitoring**: Watch contract activity
5. **Updates**: Keep community informed of progress

Good luck with your ICO launch! 🚀

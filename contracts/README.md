# ICO Smart Contracts

This directory contains the Solidity smart contracts for the ICO platform.

## Contracts

### ICOToken.sol
ERC20 token contract with:
- Pausable functionality
- Burnable tokens
- Configurable decimals
- Owner controls

### ICOSale.sol
ICO sale contract with:
- Soft cap and hard cap
- Min/max contribution limits
- Time-based sale periods
- Automatic refunds if soft cap not reached
- Owner finalization and withdrawal
- Pausable functionality

## Setup

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
cd contracts
npm install
```

### Configuration

Create a `.env` file in the contracts directory:

```env
# Private key for deployment (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# BaseScan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key

# Deployment parameters (optional, can override in script)
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

## Deployment

### Compile Contracts

```bash
npm run compile
```

### Deploy to Base Sepolia (Testnet)

```bash
npx hardhat run scripts/deploy-ico.ts --network baseSepolia
```

### Deploy to Base (Mainnet)

```bash
npx hardhat run scripts/deploy-ico.ts --network base
```

### Verify Contracts

After deployment, the script will output verification commands. Run them to verify your contracts on BaseScan:

```bash
npx hardhat verify --network baseSepolia <TOKEN_ADDRESS> "Token Name" "SYMBOL" 1000000000 18
npx hardhat verify --network baseSepolia <SALE_ADDRESS> <TOKEN_ADDRESS> ...
```

## Testing

```bash
npm test
```

## Security Considerations

⚠️ **IMPORTANT**: 
- Never commit private keys or sensitive data
- Always test on testnet first
- Get contracts audited before mainnet deployment
- Use hardware wallets for production deployments
- Implement proper access controls
- Consider using multi-sig wallets for owner functions

## Integration with Platform

After deploying contracts:
1. Copy the token and sale contract addresses
2. Update them in the ICO creation form
3. The platform will interact with these contracts via Web3
4. Users can invest directly through the platform UI

## Contract Architecture

```
ICOToken (ERC20)
    ↓ (tokens transferred)
ICOSale (Sale Logic)
    ↓ (users contribute ETH)
Users receive tokens
```

## Gas Estimates

Approximate gas costs on Base:
- Deploy ICOToken: ~2,000,000 gas
- Deploy ICOSale: ~3,000,000 gas
- Transfer tokens to sale: ~50,000 gas
- User investment: ~100,000 gas

## Support

For issues or questions, refer to:
- OpenZeppelin documentation
- Hardhat documentation  
- Base network documentation

import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('Extracting contract bytecode for edge function deployment...\n');

  const contracts = [
    'ICOToken',
    'KYCRegistry',
    'ICOSale',
    'VestingVault',
    'LiquidityLocker',
    'LISTToken',
    'StakingVault',
    'TierManager',
    'FeeDistributor',
    'GovernanceVault'
  ];

  const artifactsPath = path.join(__dirname, '../artifacts/contracts');
  const output: any = {};

  for (const contractName of contracts) {
    const artifactPath = path.join(artifactsPath, `${contractName}.sol`, `${contractName}.json`);
    
    if (!fs.existsSync(artifactPath)) {
      console.error(`❌ Artifact not found for ${contractName} at ${artifactPath}`);
      continue;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    output[contractName] = {
      abi: artifact.abi,
      bytecode: artifact.bytecode
    };

    console.log(`✅ Extracted ${contractName}`);
    console.log(`   Bytecode size: ${(artifact.bytecode.length / 2 / 1024).toFixed(2)} KB`);
  }

  // Write to deploy-ico-contracts edge function
  const icoOutputPath = path.join(__dirname, '../../supabase/functions/deploy-ico-contracts/contract-artifacts.json');
  fs.writeFileSync(icoOutputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ ICO contracts saved to: ${icoOutputPath}`);

  // Write to deploy-list-token edge function (only LIST platform contracts)
  const listPlatformContracts = {
    LISTToken: output.LISTToken,
    StakingVault: output.StakingVault,
    TierManager: output.TierManager,
    FeeDistributor: output.FeeDistributor,
    GovernanceVault: output.GovernanceVault
  };

  const listOutputPath = path.join(__dirname, '../../supabase/functions/deploy-list-token/contract-artifacts.json');
  fs.writeFileSync(listOutputPath, JSON.stringify(listPlatformContracts, null, 2));
  console.log(`✅ LIST platform contracts saved to: ${listOutputPath}`);
  
  console.log('\n🚀 Contract artifacts ready for automated deployment!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('Extracting contract bytecode for edge function deployment...\n');

  const contracts = [
    'ICOToken',
    'KYCRegistry',
    'ICOSale',
    'VestingVault',
    'LiquidityLocker'
  ];

  const artifactsPath = path.join(__dirname, '../artifacts/contracts');
  const output: any = {};

  for (const contractName of contracts) {
    // Find the artifact file
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

  // Write to edge function directory
  const outputPath = path.join(__dirname, '../../supabase/functions/deploy-ico-contracts/contract-artifacts.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Contract artifacts saved to: ${outputPath}`);
  console.log('You can now use automated deployment from the web UI!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

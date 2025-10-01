const fs = require('fs');
const path = require('path');

console.log('Reading compiled contract artifacts...\n');

const contracts = ['ICOToken', 'KYCRegistry', 'ICOSale', 'VestingVault', 'LiquidityLocker'];
const output = {};

for (const name of contracts) {
  const artifactPath = path.join(__dirname, '../artifacts/contracts', `${name}.sol`, `${name}.json`);
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    output[name] = {
      abi: artifact.abi,
      bytecode: artifact.bytecode
    };
    console.log(`✅ ${name}: ${(artifact.bytecode.length / 2 / 1024).toFixed(2)} KB`);
  } else {
    console.log(`❌ ${name}: Not found`);
  }
}

const outputPath = path.join(__dirname, '../../supabase/functions/deploy-ico-contracts/contract-artifacts.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Saved to: ${outputPath}`);
console.log('Now try deploying from the UI again!');

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Contract addresses
const CONTRACTS = {
  base: {
    address: "0x7Dc827C3178a4093c6Df6497D2A81850e98f7c44",
    explorer: "https://basescan.org",
    network: "Base",
  },
  celo: {
    address: "0x094785B0213065a68e7b3f7DD64E2f385a894a11",
    explorer: "https://celoscan.io",
    network: "Celo",
  },
};

async function checkVerificationStatus(contractInfo) {
  const { address, explorer, network } = contractInfo;

  console.log(`\n🔍 Checking ${network} contract verification status...`);
  console.log(`📍 Address: ${address}`);
  console.log(`🌐 Explorer: ${explorer}/address/${address}`);

  try {
    // Try to fetch the contract page and look for verification indicators
    const response = await fetch(`${explorer}/address/${address}`);
    const html = await response.text();

    // Look for common verification indicators in the HTML
    const isVerified =
      html.includes("Contract Source Code Verified") ||
      html.includes("✓ Contract Source Code Verified") ||
      html.includes("verified") ||
      html.includes("Verified");

    if (isVerified) {
      console.log(`✅ ${network} contract appears to be verified!`);
      console.log(`🔗 View source: ${explorer}/address/${address}#code`);
      return true;
    } else {
      console.log(`❌ ${network} contract does not appear to be verified`);
      console.log(`🔗 Contract page: ${explorer}/address/${address}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error checking ${network} contract: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Perfect? Contract Verification Status Check");
  console.log("==============================================");

  const results = {
    base: await checkVerificationStatus(CONTRACTS.base),
    celo: await checkVerificationStatus(CONTRACTS.celo),
  };

  console.log("\n📋 VERIFICATION STATUS SUMMARY");
  console.log("==============================");
  console.log(
    `Base Mainnet: ${results.base ? "✅ VERIFIED" : "❌ NOT VERIFIED"}`,
  );
  console.log(
    `Celo Mainnet: ${results.celo ? "✅ VERIFIED" : "❌ NOT VERIFIED"}`,
  );

  if (results.base && results.celo) {
    console.log("\n🎉 Both contracts are already verified!");
    console.log("📖 Users can read the contract source code on both explorers");
  } else if (results.base || results.celo) {
    console.log("\n⚠️  One contract is verified, one needs verification");
  } else {
    console.log("\n❌ Both contracts need verification");
    console.log("💡 You may need to:");
    console.log("   1. Create a new Etherscan API key for V2");
    console.log("   2. Verify manually through the explorer websites");
    console.log("   3. Use a different verification method");
  }

  console.log("\n🌐 DIRECT LINKS");
  console.log("===============");
  console.log(
    `Base: ${CONTRACTS.base.explorer}/address/${CONTRACTS.base.address}#code`,
  );
  console.log(
    `Celo: ${CONTRACTS.celo.explorer}/address/${CONTRACTS.celo.address}#code`,
  );
}

main().catch(console.error);

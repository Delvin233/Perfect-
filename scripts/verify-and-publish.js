import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

// Contract addresses
const CONTRACTS = {
  base: {
    address: "0x7Dc827C3178a4093c6Df6497D2A81850e98f7c44",
    network: "base",
    explorer: "https://basescan.org",
  },
  celo: {
    address: "0x094785B0213065a68e7b3f7DD64E2f385a894a11",
    network: "celo",
    explorer: "https://celoscan.io",
  },
};

async function verifyContract(contractInfo) {
  const { address, network, explorer } = contractInfo;

  console.log(`\n🔍 Verifying ${network.toUpperCase()} contract...`);
  console.log(`📍 Address: ${address}`);
  console.log(`🌐 Explorer: ${explorer}/address/${address}`);

  try {
    // Construct the verification command (using verify:verify for new plugin)
    const command = `npx hardhat verify:verify --network ${network} ${address}`;

    console.log(`⚡ Running: ${command}`);

    const { stdout, stderr } = await execAsync(command);

    if (
      stdout.includes("Successfully verified") ||
      stdout.includes("Already verified")
    ) {
      console.log(
        `✅ ${network.toUpperCase()} contract verified successfully!`,
      );
      console.log(`🔗 View on explorer: ${explorer}/address/${address}#code`);
      return true;
    } else {
      console.log(`📝 Output: ${stdout}`);
      if (stderr) console.log(`⚠️  Stderr: ${stderr}`);
      return false;
    }
  } catch (error) {
    if (error.message.includes("Already verified")) {
      console.log(`✅ ${network.toUpperCase()} contract already verified!`);
      console.log(`🔗 View on explorer: ${explorer}/address/${address}#code`);
      return true;
    } else {
      console.log(`❌ Error verifying ${network} contract:`);
      console.log(`   ${error.message}`);
      return false;
    }
  }
}

async function checkApiKeys() {
  const etherscanKey = process.env.ETHERSCAN_API_KEY;

  console.log("🔑 Checking API Key...");

  if (!etherscanKey || etherscanKey === "your-etherscan-api-key-here") {
    console.log("❌ Etherscan API key not set or using placeholder");
    console.log("   Get your API key from: https://etherscan.io/apis");
    return false;
  }

  console.log("✅ Etherscan API key configured");
  console.log(
    "   💡 Will use same key for both Base and Celo (like Scaffold-ETH)",
  );
  return true;
}

async function main() {
  console.log("🚀 Perfect? Smart Contract Verification & Publishing");
  console.log("===================================================");

  // Check API key first
  const hasApiKey = await checkApiKeys();
  if (!hasApiKey) {
    console.log("\n❌ Please set up your Etherscan API key in .env file first");
    console.log("📖 Get it from: https://etherscan.io/apis");
    process.exit(1);
  }

  const results = {
    base: false,
    celo: false,
  };

  // Verify both contracts using same Etherscan API key
  results.base = await verifyContract(CONTRACTS.base);
  results.celo = await verifyContract(CONTRACTS.celo);

  // Summary
  console.log("\n📋 VERIFICATION SUMMARY");
  console.log("=======================");
  console.log(
    `Base Mainnet: ${results.base ? "✅ VERIFIED & PUBLISHED" : "❌ FAILED"}`,
  );
  console.log(
    `Celo Mainnet: ${results.celo ? "✅ VERIFIED & PUBLISHED" : "❌ FAILED"}`,
  );

  if (results.base && results.celo) {
    console.log("\n🎉 All contracts verified and published successfully!");
    console.log("🔗 Source code is now visible on both explorers");
    console.log("📖 Users can read the contract code and verify functionality");
  } else if (results.base || results.celo) {
    console.log("\n🎉 At least one contract verified successfully!");
    console.log("🔗 Source code is now visible on block explorers");
  } else {
    console.log("\n⚠️  Contract verification failed");
    console.log("🔧 Check your Etherscan API key and network configuration");
  }

  // Show explorer links
  console.log("\n🌐 EXPLORER LINKS");
  console.log("=================");
  console.log(
    `Base: ${CONTRACTS.base.explorer}/address/${CONTRACTS.base.address}#code`,
  );
  console.log(
    `Celo: ${CONTRACTS.celo.explorer}/address/${CONTRACTS.celo.address}#code`,
  );
}

main().catch(console.error);

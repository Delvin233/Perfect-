import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Contract addresses with V2 API configuration
const CONTRACTS = {
  base: {
    address: "0x7Dc827C3178a4093c6Df6497D2A81850e98f7c44",
    network: "base",
    chainId: "8453", // Base mainnet chain ID
    explorer: "https://basescan.org",
    apiUrl: "https://api.etherscan.io/v2/api",
    explorerName: "BaseScan",
  },
  celo: {
    address: "0x094785B0213065a68e7b3f7DD64E2f385a894a11",
    network: "celo",
    chainId: "42220", // Celo mainnet chain ID
    explorer: "https://celoscan.io",
    apiUrl: "https://api.etherscan.io/v2/api",
    explorerName: "CeloScan",
  },
};

async function verifyContract(contractInfo) {
  const { address, network, chainId, explorer, apiUrl, explorerName } =
    contractInfo;

  console.log(`\n🔍 Verifying ${network.toUpperCase()} contract...`);
  console.log(`📍 Address: ${address}`);
  console.log(`🌐 Explorer: ${explorer}/address/${address}`);

  try {
    const apiKey = process.env.ETHERSCAN_API_KEY;

    // Get contract source code
    const contractPath = path.join(
      process.cwd(),
      "contracts",
      "PerfectLeaderboard.sol",
    );
    const sourceCode = fs.readFileSync(contractPath, "utf8");

    console.log(`⚡ Submitting to ${explorerName} API...`);

    // Create verification payload using URL-encoded format with V2 API
    const params = new URLSearchParams({
      chainid: chainId,
      module: "contract",
      action: "verifysourcecode",
      apikey: apiKey,
      contractaddress: address,
      sourceCode: sourceCode,
      codeformat: "solidity-single-file",
      contractname: "PerfectLeaderboard",
      compilerversion: "v0.8.20+commit.a1b79de6",
      optimizationUsed: "1",
      runs: "200",
      constructorArguements: "",
      evmversion: "shanghai",
      licenseType: "3", // MIT License
    });

    // Submit verification
    const submitResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const submitResult = await submitResponse.json();

    if (submitResult.status === "1") {
      const guid = submitResult.result;
      console.log(`📋 Verification submitted with GUID: ${guid}`);

      // Check verification status
      let attempts = 0;
      const maxAttempts = 15;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

        const checkUrl = `${apiUrl}?chainid=${chainId}&module=contract&action=checkverifystatus&guid=${guid}&apikey=${apiKey}`;
        const checkResponse = await fetch(checkUrl);
        const checkResult = await checkResponse.json();

        if (checkResult.status === "1") {
          console.log(
            `✅ ${network.toUpperCase()} contract verified successfully!`,
          );
          console.log(
            `🔗 View on explorer: ${explorer}/address/${address}#code`,
          );
          return true;
        } else if (checkResult.result === "Pending in queue") {
          console.log(
            `⏳ Verification pending... (${attempts + 1}/${maxAttempts})`,
          );
          attempts++;
        } else {
          console.log(`❌ Verification failed: ${checkResult.result}`);
          return false;
        }
      }

      console.log(`⏰ Verification timed out after ${maxAttempts} attempts`);
      console.log(`🔗 Check manually: ${explorer}/address/${address}#code`);
      return false;
    } else {
      console.log(`❌ Failed to submit verification: ${submitResult.result}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error verifying ${network} contract:`);
    console.log(`   ${error.message}`);
    return false;
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
  console.log("   💡 Will use same key for both Base and Celo");
  return true;
}

async function main() {
  console.log("🚀 Perfect? Smart Contract Direct Verification");
  console.log("==============================================");

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

  // Verify both contracts using direct API calls
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

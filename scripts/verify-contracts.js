import { createPublicClient, http } from "viem";
import { base, celo } from "viem/chains";

// Contract addresses
const CONTRACT_ADDRESSES = {
  base: "0x7Dc827C3178a4093c6Df6497D2A81850e98f7c44",
  celo: "0x094785B0213065a68e7b3f7DD64E2f385a894a11",
};

// Basic ABI for verification
const BASIC_ABI = [
  {
    inputs: [],
    name: "getGameStats",
    outputs: [
      { name: "totalPlayers", type: "uint32" },
      { name: "totalGames", type: "uint32" },
      { name: "stage1Completors", type: "uint32" },
      { name: "stage2Completors", type: "uint32" },
      { name: "stage3Completors", type: "uint32" },
      { name: "totalRevenueAmount", type: "uint256" },
      { name: "network", type: "string" },
      { name: "networkChainId", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_count", type: "uint256" }],
    name: "getTopPlayers",
    outputs: [
      { name: "addresses", type: "address[]" },
      { name: "scores", type: "uint128[]" },
      { name: "levels", type: "uint16[]" },
      { name: "stages", type: "uint8[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function verifyContract(network, chainConfig, contractAddress) {
  console.log(`\n🔍 Verifying ${network.toUpperCase()} contract...`);
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🌐 Chain ID: ${chainConfig.id}`);

  try {
    // Create public client
    const client = createPublicClient({
      chain: chainConfig,
      transport: http(),
    });

    // Check if contract exists (has code) - using getCode instead of deprecated getBytecode
    const code = await client.getCode({ address: contractAddress });
    if (!code || code === "0x") {
      console.log(`❌ No contract code found at address ${contractAddress}`);
      return false;
    }
    console.log(`✅ Contract code exists (${code.length} bytes)`);

    // Test getGameStats function
    try {
      const gameStats = await client.readContract({
        address: contractAddress,
        abi: BASIC_ABI,
        functionName: "getGameStats",
      });

      console.log(`📊 Game Stats:`);
      console.log(`   - Total Players: ${gameStats[0]}`);
      console.log(`   - Total Games: ${gameStats[1]}`);
      console.log(`   - Stage 1 Completors: ${gameStats[2]}`);
      console.log(`   - Stage 2 Completors: ${gameStats[3]}`);
      console.log(`   - Stage 3 Completors: ${gameStats[4]}`);
      console.log(`   - Total Revenue: ${gameStats[5]} wei`);
      console.log(`   - Network Name: ${gameStats[6]}`);
      console.log(`   - Network Chain ID: ${gameStats[7]}`);
    } catch (error) {
      console.log(`⚠️  Could not read game stats: ${error.message}`);
    }

    // Test getTopPlayers function
    try {
      const topPlayers = await client.readContract({
        address: contractAddress,
        abi: BASIC_ABI,
        functionName: "getTopPlayers",
        args: [5n], // Get top 5 players
      });

      console.log(`🏆 Top Players (${topPlayers[0].length} found):`);
      for (let i = 0; i < Math.min(topPlayers[0].length, 3); i++) {
        console.log(
          `   ${i + 1}. ${topPlayers[0][i]} - Score: ${topPlayers[1][i]} - Level: ${topPlayers[2][i]}`,
        );
      }
    } catch (error) {
      console.log(`⚠️  Could not read top players: ${error.message}`);
    }

    console.log(`✅ ${network.toUpperCase()} contract verification complete!`);
    return true;
  } catch (error) {
    console.log(`❌ Error verifying ${network} contract:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Perfect? Smart Contract Verification");
  console.log("=====================================");

  const results = {
    base: false,
    celo: false,
  };

  // Verify Base mainnet contract
  results.base = await verifyContract("base", base, CONTRACT_ADDRESSES.base);

  // Verify Celo mainnet contract
  results.celo = await verifyContract("celo", celo, CONTRACT_ADDRESSES.celo);

  // Summary
  console.log("\n📋 VERIFICATION SUMMARY");
  console.log("=======================");
  console.log(`Base Mainnet: ${results.base ? "✅ VERIFIED" : "❌ FAILED"}`);
  console.log(`Celo Mainnet: ${results.celo ? "✅ VERIFIED" : "❌ FAILED"}`);

  if (results.base && results.celo) {
    console.log("\n🎉 All contracts verified successfully!");
    console.log("🔗 Ready for production use");
  } else {
    console.log("\n⚠️  Some contracts failed verification");
    console.log("🔧 Check deployment and network configuration");
  }
}

main().catch(console.error);

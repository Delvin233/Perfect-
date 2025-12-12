import hre from "hardhat";

async function main() {
  console.log(`\n🚀 Deploying PerfectLeaderboard to ${hre.network.name}...`);

  // Determine network name for contract
  let networkName;
  let expectedChainId;

  switch (hre.network.name) {
    case "base":
      networkName = "Base";
      expectedChainId = 8453;
      break;
    case "baseSepolia":
      networkName = "Base Sepolia";
      expectedChainId = 84532;
      break;
    case "celo":
      networkName = "Celo";
      expectedChainId = 42220;
      break;
    case "celoAlfajores":
      networkName = "Celo Alfajores";
      expectedChainId = 44787;
      break;
    case "localhost":
    case "hardhat":
      networkName = "Local";
      expectedChainId = 31337;
      break;
    default:
      networkName = hre.network.name;
      expectedChainId = 0;
  }

  console.log(`📡 Network: ${networkName}`);
  console.log(`🔗 Chain ID: ${expectedChainId}`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);

  // Check balance
  const balance = await deployer.getBalance();
  console.log(`💰 Balance: ${hre.ethers.utils.formatEther(balance)} ETH`);

  if (balance.isZero()) {
    throw new Error("❌ Deployer account has no funds!");
  }

  // Deploy contract
  console.log("\n📦 Deploying contract...");
  const PerfectLeaderboard =
    await hre.ethers.getContractFactory("PerfectLeaderboard");
  const leaderboard = await PerfectLeaderboard.deploy(networkName);

  console.log("⏳ Waiting for deployment...");
  await leaderboard.deployed();

  console.log("\n✅ Deployment successful!");
  console.log(`📍 Contract Address: ${leaderboard.address}`);
  console.log(`🧾 Transaction Hash: ${leaderboard.deployTransaction.hash}`);

  // Verify contract configuration
  console.log("\n🔍 Verifying contract configuration...");
  try {
    const contractInfo = await leaderboard.getContractInfo();
    const networkConfig = await leaderboard.getNetworkConfig();

    console.log(`✅ Contract Name: ${contractInfo[0]}`);
    console.log(`✅ Network: ${contractInfo[1]}`);
    console.log(`✅ Chain ID: ${contractInfo[2]}`);
    console.log(`✅ Owner: ${contractInfo[4]}`);
    console.log(
      `✅ Submission Fee: ${hre.ethers.utils.formatEther(networkConfig[2])} ETH`,
    );
    console.log(
      `✅ Continue Fee: ${hre.ethers.utils.formatEther(networkConfig[3])} ETH`,
    );
    console.log(
      `✅ Daily Challenge Fee: ${hre.ethers.utils.formatEther(networkConfig[4])} ETH`,
    );
  } catch (error) {
    console.log("⚠️  Could not verify contract configuration:", error.message);
  }

  // Environment variable instructions
  console.log("\n📝 Environment Variables:");
  console.log("Add this to your .env file:");
  console.log(
    `NEXT_PUBLIC_LEADERBOARD_CONTRACT_${networkName.toUpperCase().replace(/ /g, "_")}=${leaderboard.address}`,
  );

  if (
    networkName.includes("Sepolia") ||
    networkName.includes("Alfajores") ||
    networkName === "Local"
  ) {
    console.log("\n🧪 Testnet Deployment Complete!");
    console.log("This is a testnet deployment. For mainnet, use:");
    console.log("- npx hardhat run scripts/deploy.js --network base");
    console.log("- npx hardhat run scripts/deploy.js --network celo");
  } else {
    console.log("\n🌐 Mainnet Deployment Complete!");
    console.log("⚠️  This is a MAINNET deployment with real funds!");
  }

  // Gas usage info
  const receipt = await leaderboard.deployTransaction.wait();
  const gasUsed = receipt.gasUsed;
  const gasPrice = leaderboard.deployTransaction.gasPrice;
  const deploymentCost = gasUsed.mul(gasPrice);

  console.log(`\n⛽ Gas Used: ${gasUsed.toNumber().toLocaleString()}`);
  console.log(
    `💸 Deployment Cost: ${hre.ethers.utils.formatEther(deploymentCost)} ETH`,
  );

  console.log("\n🎯 Next Steps:");
  console.log("1. Add the contract address to your .env file");
  console.log("2. Update your frontend to use the new contract");
  console.log("3. Test the contract functions");
  console.log("4. Consider verifying the contract on the block explorer");

  if (!networkName.includes("Local")) {
    console.log("\n🔍 Verify contract (optional):");
    console.log(
      `npx hardhat verify --network ${hre.network.name} ${leaderboard.address} "${networkName}"`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

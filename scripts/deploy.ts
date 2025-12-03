import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PerfectLeaderboard contract...");

  const PerfectLeaderboard = await ethers.getContractFactory("PerfectLeaderboard");
  const leaderboard = await PerfectLeaderboard.deploy();

  await leaderboard.waitForDeployment();

  const address = await leaderboard.getAddress();
  console.log(`PerfectLeaderboard deployed to: ${address}`);
  console.log("\nSave this address to your .env file:");
  console.log(`NEXT_PUBLIC_LEADERBOARD_CONTRACT=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import hre, { ethers } from "hardhat";

const deployedContracts: any = {
  mumbai: {
    betChecker: "0xf8fFB77d3c3C72d11B72C67D7fc1C77b8c958cB6",
  },
};

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("Chain is not defined");
    return;
  }
  console.log("Running on chain: " + chain);

  // Define deployed contracts by chain
  const chainDeployedContracts = deployedContracts[chain];

  // Deploy bet checker contract
  if (chainDeployedContracts.betChecker === "") {
    console.log("Start deploy bet checker contract");
    const contract = await ethers
      .getContractFactory("BetChecker")
      .then((factory) => factory.deploy());
    console.log("Bet checker contract deployed to " + contract.address);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

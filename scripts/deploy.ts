import hre, { ethers } from "hardhat";

const deployedContracts: any = {
  mumbai: {
    betChecker: "0x11f06Bf523bec24C16424643c03946221Aa98e40",
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

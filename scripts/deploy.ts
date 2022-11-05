import hre, { ethers } from "hardhat";

const deployedContracts: any = {
  mumbai: {
    betChecker: "0xE78Ec547bdE5697c1Dd2B32524c9a51F4385CC08",
    bet: "0x843Ce23DF9EB3cAD47B69BC42D68de58A80b9f62",
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
    const feedSymbols = ["ETHUSD"];
    const feedAddresses = ["0x0715A7794a1dc8e42615F059dD6e406A6594651A"];
    const contract = await ethers
      .getContractFactory("BetChecker")
      .then((factory) => factory.deploy(feedSymbols, feedAddresses));
    console.log("Bet checker contract deployed to " + contract.address);
  }

  if (
    chainDeployedContracts.bet === "" &&
    chainDeployedContracts.betChecker !== ""
  ) {
    console.log("Start deploy bet contract");
    const contract = await ethers
      .getContractFactory("Bet")
      .then((factory) => factory.deploy(chainDeployedContracts.betChecker));
    console.log("Bet contract deployed to " + contract.address);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

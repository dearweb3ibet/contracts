import hre, { ethers } from "hardhat";
import { deployedContracts } from "./constants";

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

  // Deploy contest contract
  if (chainDeployedContracts.contest === "") {
    console.log("Start deploy contest contract");
    const winnersNumber = 3;
    const contract = await ethers
      .getContractFactory("Contest")
      .then((factory) => factory.deploy(winnersNumber));
    console.log("Contest contract deployed to " + contract.address);
  }

  // Deploy usage contract
  if (chainDeployedContracts.usage === "") {
    console.log("Start deploy usage contract");
    const contract = await ethers
      .getContractFactory("Usage")
      .then((factory) => factory.deploy());
    console.log("Usage contract deployed to " + contract.address);
  }

  if (
    chainDeployedContracts.bet === "" &&
    chainDeployedContracts.betChecker !== "" &&
    chainDeployedContracts.contest !== "" &&
    chainDeployedContracts.usage !== ""
  ) {
    console.log("Start deploy bet contract");
    const contestFeePercent = 15;
    const usageFeePercent = 10;
    const contract = await ethers
      .getContractFactory("Bet")
      .then((factory) =>
        factory.deploy(
          chainDeployedContracts.betChecker,
          chainDeployedContracts.contest,
          chainDeployedContracts.usage,
          contestFeePercent,
          usageFeePercent
        )
      );
    console.log("Bet contract deployed to " + contract.address);
  }

  if (chainDeployedContracts.bio === "") {
    console.log("Start deploy bio contract");
    const contract = await ethers
      .getContractFactory("Bio")
      .then((factory) => factory.deploy());
    console.log("Bio contract deployed to " + contract.address);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import hre, { ethers } from "hardhat";
import { contractArguments, deployedContracts } from "./constants";

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("Chain is not defined");
    return;
  }
  console.log("Running on chain: " + chain);

  // Define deployed contracts and arguments by chain
  const chainDeployedContracts = deployedContracts[chain];
  const chainContractArguments = contractArguments[chain];

  // Deploy bet checker contract
  if (chainDeployedContracts.betChecker === "") {
    console.log("Start deploy bet checker contract");
    const contract = await ethers
      .getContractFactory("BetChecker")
      .then((factory) =>
        factory.deploy(
          chainContractArguments.betChecker.feedSymbols,
          chainContractArguments.betChecker.feedAddresses
        )
      );
    console.log("Contract deployed to " + contract.address);
  }

  // Deploy contest contract
  if (chainDeployedContracts.contest === "") {
    console.log("Start deploy contest contract");
    const contract = await ethers
      .getContractFactory("Contest")
      .then((factory) =>
        factory.deploy(chainContractArguments.contest.winnersNumber)
      );
    console.log("Contract deployed to " + contract.address);
  }

  // Deploy usage contract
  if (chainDeployedContracts.usage === "") {
    console.log("Start deploy usage contract");
    const contract = await ethers
      .getContractFactory("Usage")
      .then((factory) => factory.deploy());
    console.log("Contract deployed to " + contract.address);
  }

  if (
    chainDeployedContracts.bet === "" &&
    chainDeployedContracts.betChecker !== "" &&
    chainDeployedContracts.contest !== "" &&
    chainDeployedContracts.usage !== ""
  ) {
    console.log("Start deploy bet contract");
    const contract = await ethers
      .getContractFactory("Bet")
      .then((factory) =>
        factory.deploy(
          chainDeployedContracts.betChecker,
          chainDeployedContracts.contest,
          chainDeployedContracts.usage,
          chainContractArguments.bet.contestFeePercent,
          chainContractArguments.bet.usageFeePercent
        )
      );
    console.log("Contract deployed to " + contract.address);
  }

  if (chainDeployedContracts.bio === "") {
    console.log("Start deploy bio contract");
    const contract = await ethers
      .getContractFactory("Bio")
      .then((factory) => factory.deploy());
    console.log("Contract deployed to " + contract.address);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import hre, { ethers } from "hardhat";
import { deployedContracts } from "./constants";

const betContractAbi: any = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

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

  // Define accounts
  const accounts = await ethers.getSigners();

  // Define contracts
  const betContract = new ethers.Contract(
    chainDeployedContracts.bet,
    betContractAbi
  );

  // Run some functions
  const betContractOwner = await betContract.connect(accounts[0]).owner();
  console.log("Bet contract owner:", betContractOwner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

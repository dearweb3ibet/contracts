import { ethers } from "hardhat";

async function main() {
  // Define accounts
  const accounts = await ethers.getSigners();

  // Define contracts
  const betContractAddress = "0xe8A58b067f749dA3E7AecCD9c42bd10241F3ecD7";
  const betContractAbi: any = [
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
  ];
  const betContract = new ethers.Contract(betContractAddress, betContractAbi);

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

import { ethers } from "hardhat";
import { deployedContracts } from "./helpers/constants";

async function main() {
  // Init data
  const accounts = await ethers.getSigners();
  const betContractAddress = deployedContracts.mumbai.bet.proxy;

  // Run some functions
  let transaction;
  // transaction = await Bet__factory.connect(
  //   betContractAddress,
  //   accounts[0]
  // ).create(
  //   "",
  //   ethers.utils.parseEther("0.01"),
  //   "ETHUSD",
  //   1200,
  //   1600,
  //   1672099200,
  //   1671580800,
  //   {
  //     value: ethers.utils.parseEther("0.01"),
  //   }
  // );
  // transaction = await Bet__factory.connect(
  //   betContractAddress,
  //   accounts[1]
  // ).takePart(1, ethers.utils.parseEther("0.006"), false, {
  //   value: ethers.utils.parseEther("0.006"),
  // });
  // transaction = await Bet__factory.connect(
  //   betContractAddress,
  //   accounts[0]
  // ).close(1);
  // await transaction.wait();
  console.log("transaction:", transaction);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("BetChecker", function () {
  // Accounts
  let account1: Signer;
  let account2: Signer;
  // Contract
  let contract: Contract;

  before(async function () {
    // Init accounts
    [account1, account2] = await ethers.getSigners();
    // Deploy contract
    contract = await ethers
      .getContractFactory("BetChecker")
      .then((factory) => factory.deploy());
  });

  // TODO: Complete test
  it("Should check if price is exist", async function () {
    const result = await contract.isPriceExist(
      "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
      1667001600,
      1000,
      1100
    );
    console.log("[Dev] result", result);
  });
});

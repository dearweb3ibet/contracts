import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe.only("Bet", function () {
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
      .getContractFactory("Bet")
      .then((factory) => factory.deploy());
  });

  it("Should mint token", async function () {
    const uri = "";
    const minPrice = 1000;
    const maxPrice = 1200;
    const dayStartTimestamp = 1667088000;
    const rate = "0.01";
    await expect(
      contract
        .connect(account1)
        .create(
          uri,
          minPrice,
          maxPrice,
          dayStartTimestamp,
          ethers.utils.parseEther(rate),
          {
            value: ethers.utils.parseEther(rate),
          }
        )
    ).to.changeEtherBalance(
      account1,
      ethers.utils.parseEther(rate).mul(BigInt("-1"))
    );
  });
});

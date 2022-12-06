import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Usage", function () {
  // Constants
  const usageBalance = BigNumber.from("500000000000000000");
  // Accounts
  let accounts: Array<Signer>;
  // Contracts
  let usageContract: Contract;

  before(async function () {
    // Init accounts
    accounts = await ethers.getSigners();
    // Init contracts
    usageContract = await ethers
      .getContractFactory("Usage")
      .then((factory) => factory.deploy());
  });

  it("Should send and withdraw tokens", async function () {
    // Send tokens
    await expect(
      accounts[0].sendTransaction({
        to: usageContract.address,
        value: usageBalance,
      })
    ).to.changeEtherBalances(
      [accounts[0], usageContract.address],
      [usageBalance.mul(ethers.constants.NegativeOne), usageBalance]
    );
    // Withdraw tokens by not owner
    await expect(
      usageContract.connect(accounts[1]).withdraw()
    ).to.be.revertedWith("Ownable: caller is not the owner");
    // Withdraw tokens by owner
    await expect(
      usageContract.connect(accounts[0]).withdraw()
    ).to.changeEtherBalances(
      [accounts[0], usageContract.address],
      [usageBalance, usageBalance.mul(ethers.constants.NegativeOne)]
    );
  });
});

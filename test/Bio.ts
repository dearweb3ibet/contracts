import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Bio", function () {
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
      .getContractFactory("Bio")
      .then((factory) => factory.deploy());
  });

  it("Should own only one token after several uri changes", async function () {
    // Check balance before first uri change
    expect(await contract.balanceOf(await account1.getAddress())).to.equal(
      BigNumber.from(0)
    );
    // First change uri and check balance
    await contract.connect(account1).setURI("ipfs://");
    expect(await contract.balanceOf(await account1.getAddress())).to.equal(
      BigNumber.from(1)
    );
    // Second change uri and check balance
    await contract.connect(account1).setURI("ipfs://");
    expect(await contract.balanceOf(await account1.getAddress())).to.equal(
      BigNumber.from(1)
    );
  });

  it("Should fail transfer token", async function () {
    await expect(
      contract
        .connect(account1)
        .transferFrom(
          await account1.getAddress(),
          await account2.getAddress(),
          "1"
        )
    ).to.be.revertedWith("Token is non-transferable");
  });
});

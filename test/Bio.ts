import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import { Bio, Bio__factory } from "../typechain-types";

describe("Bio", function () {
  // Accounts
  let accounts: Array<Signer>;
  let deployer: Signer;
  let userOne: Signer;
  let userTwo: Signer;
  // Addresses
  let deployAddress: string;
  let userOneAddress: string;
  let userTwoAddress: string;
  // Contract
  let bioContract: Bio;

  before(async function () {
    // Init accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    userOne = accounts[1];
    userTwo = accounts[2];
    // Init addresses
    deployAddress = await deployer.getAddress();
    userOneAddress = await userOne.getAddress();
    userTwoAddress = await userTwo.getAddress();
    // Deploy contracts
    bioContract = await new Bio__factory(deployer).deploy();
  });

  it("Should own only one token after several uri changes", async function () {
    // Init test data
    const uriEmpty = "";
    const uriOne = "ipfs://one";
    const uriTwo = "ipfs://two";
    // Check before first uri change
    expect(await bioContract.balanceOf(userOneAddress)).to.equal(
      ethers.constants.Zero
    );
    expect(await bioContract.getURI(userOneAddress)).to.equal(uriEmpty);
    // First change uri and check
    await expect(bioContract.connect(userOne).setURI(uriOne)).to.be.not
      .reverted;
    expect(await bioContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await bioContract.getURI(userOneAddress)).to.equal(uriOne);
    // Second change uri and check
    await expect(bioContract.connect(userOne).setURI(uriTwo)).to.be.not
      .reverted;
    expect(await bioContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await bioContract.getURI(userOneAddress)).to.equal(uriTwo);
  });

  it("Should fail transfer token", async function () {
    // Init test data
    const tokenId = "1";
    // Test transfer
    await expect(
      bioContract
        .connect(userOne)
        .transferFrom(userOneAddress, userTwoAddress, tokenId)
    ).to.be.revertedWith("Token is non-transferable");
  });
});

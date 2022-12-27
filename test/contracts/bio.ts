import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  bioContract,
  bioUris,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../setup";

makeSuiteCleanRoom("Bio", function () {
  it("User should to own only one token after several uri changes", async function () {
    // Before changes
    expect(await bioContract.balanceOf(userOneAddress)).to.equal(
      ethers.constants.Zero
    );
    expect(await bioContract.getURI(userOneAddress)).to.equal("");
    // First change
    await expect(
      bioContract.connect(userOne).setURI(bioUris.one)
    ).to.be.not.reverted;
    expect(await bioContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await bioContract.getURI(userOneAddress)).to.equal(bioUris.one);
    // Second change
    await expect(
      bioContract.connect(userOne).setURI(bioUris.two)
    ).to.be.not.reverted;
    expect(await bioContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await bioContract.getURI(userOneAddress)).to.equal(bioUris.two);
  });

  it("User should fail to transfer token", async function () {
    // Set uri
    await expect(
      bioContract.connect(userTwo).setURI(bioUris.one)
    ).to.be.not.reverted;
    // Get token id
    const tokenId = await bioContract.getTokenId(userTwoAddress);
    // Transfer
    await expect(
      bioContract
        .connect(userTwo)
        .transferFrom(userTwoAddress, userThreeAddress, tokenId)
    ).to.be.revertedWith("Token is non-transferable");
  });
});

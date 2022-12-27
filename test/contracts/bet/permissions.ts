import { expect } from "chai";
import { ethers } from "hardhat";
import {
  betContract,
  deployer,
  makeSuiteCleanRoom,
  userOne,
} from "../../setup";

makeSuiteCleanRoom("Bet Permissions", function () {
  it("User should fail to use only owner functions", async function () {
    // Pause functions
    await expect(betContract.connect(userOne).pause()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
    await expect(betContract.connect(userOne).uppause()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
    // Set functions
    await expect(
      betContract.connect(userOne).setHubAddress(ethers.constants.AddressZero)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      betContract.connect(userOne).setContestFeePercent(ethers.constants.Zero)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      betContract.connect(userOne).setUsageFeePercent(ethers.constants.Zero)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deployer should be able to use only owner functions", async function () {
    // Pause functions
    await expect(betContract.connect(deployer).pause()).to.be.not.reverted;
    await expect(betContract.connect(deployer).uppause()).to.be.not.reverted;
    // Set functions
    await expect(
      betContract.connect(deployer).setHubAddress(ethers.constants.AddressZero)
    ).to.be.not.reverted;
    await expect(
      betContract.connect(deployer).setContestFeePercent(ethers.constants.Zero)
    ).to.be.not.reverted;
    await expect(
      betContract.connect(deployer).setUsageFeePercent(ethers.constants.Zero)
    ).to.be.not.reverted;
  });
});

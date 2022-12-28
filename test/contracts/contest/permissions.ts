import { expect } from "chai";
import { ethers } from "hardhat";
import {
  contestContract,
  deployer,
  makeSuiteCleanRoom,
  userOne,
} from "../../setup";

makeSuiteCleanRoom("Contest Permissions", function () {
  it("User should fail to use only owner functions", async function () {
    await expect(
      contestContract
        .connect(userOne)
        .setHubAddress(ethers.constants.AddressZero)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deployer should be able to use only owner functions", async function () {
    await expect(
      contestContract
        .connect(deployer)
        .setHubAddress(ethers.constants.AddressZero)
    ).to.be.not.reverted;
  });
});

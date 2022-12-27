import { expect } from "chai";
import { ethers } from "hardhat";
import { deployer, hubContract, makeSuiteCleanRoom, userOne } from "../setup";

makeSuiteCleanRoom("Hub", function () {
  it("User should fail to use only owner functions", async function () {
    await expect(
      hubContract.connect(userOne).setBetAddress(ethers.constants.AddressZero)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deployer should be able to use only owner functions", async function () {
    await expect(
      hubContract.connect(deployer).setBetAddress(ethers.constants.AddressZero)
    ).to.be.not.reverted;
  });
});

import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  deployer,
  deployerAddress,
  makeSuiteCleanRoom,
  usageContract,
  userOne,
} from "../setup";

makeSuiteCleanRoom("Usage", function () {
  it("User should fail withdraw ethers", async function () {
    await expect(usageContract.connect(userOne).withdraw()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Deployer should withdraw ethers", async function () {
    // Define balance
    const usageBalance = BigNumber.from("500000000000000000");
    // Send ethers to contract
    await deployer.sendTransaction({
      to: usageContract.address,
      value: usageBalance,
    });
    // Withdraw
    await expect(
      usageContract.connect(deployer).withdraw()
    ).to.changeEtherBalances(
      [deployerAddress, usageContract.address],
      [usageBalance, usageBalance.mul(ethers.constants.NegativeOne)]
    );
  });
});

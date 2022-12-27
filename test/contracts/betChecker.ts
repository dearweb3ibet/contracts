import { expect } from "chai";
import { ethers } from "hardhat";
import {
  betCheckerContract,
  betCheckerContractParams,
  betParams,
  deployer,
  makeSuiteCleanRoom,
  userOne,
} from "../setup";

makeSuiteCleanRoom("Bet Checker", function () {
  it("User should fail to use only owner functions", async function () {
    await expect(
      betCheckerContract.connect(userOne).setFeedAddresses([], [])
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deployer should be able to use only owner functions", async function () {
    await expect(
      betCheckerContract.connect(deployer).setFeedAddresses([], [])
    ).to.be.not.reverted;
  });

  it("User should fail to check price if day start timestamp has not come", async function () {
    await expect(
      betCheckerContract.isPriceExist(
        betParams.one.symbol,
        betParams.one.targetTimestamp,
        betParams.one.targetMinPrice,
        betParams.one.targetMaxPrice
      )
    ).to.be.revertedWith("Day start timestamp has not come");
  });

  it("Deployer should set and update feed address", async function () {
    // Check address before
    expect(
      await betCheckerContract.getFeedAddress(
        betCheckerContractParams.feedSymbolBtcUsd
      )
    ).to.be.equal(ethers.constants.AddressZero);
    // Set first version of feed
    await expect(
      betCheckerContract
        .connect(deployer)
        .setFeedAddresses(
          [betCheckerContractParams.feedSymbolBtcUsd],
          [betCheckerContractParams.feedAddressBtcUsdOne]
        )
    ).to.be.not.reverted;
    expect(
      await betCheckerContract.getFeedAddress(
        betCheckerContractParams.feedSymbolBtcUsd
      )
    ).to.be.equal(betCheckerContractParams.feedAddressBtcUsdOne);
    // Set second version of feed
    await expect(
      betCheckerContract
        .connect(deployer)
        .setFeedAddresses(
          [betCheckerContractParams.feedSymbolBtcUsd],
          [betCheckerContractParams.feedAddressBtcUsdTwo]
        )
    ).to.be.not.reverted;
    expect(
      await betCheckerContract.getFeedAddress(
        betCheckerContractParams.feedSymbolBtcUsd
      )
    ).to.be.equal(betCheckerContractParams.feedAddressBtcUsdTwo);
  });
});

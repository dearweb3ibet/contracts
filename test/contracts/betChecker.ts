import { expect } from "chai";
import { ethers } from "hardhat";
import {
  betCheckerContract,
  betCheckerContractParams,
  deployer,
} from "../setup";

describe("BetChecker", function () {
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

import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { BetChecker, BetChecker__factory } from "../../typechain-types";

describe("BetChecker", function () {
  // Constants
  const feedSymbolEthUsd = "ETHUSD";
  const feedSymbolBtcUsd = "BTCUSD";
  const feedAddressEthUsd = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
  const feedAddressBtcUsdV1 = "0x12162c3E810393dEC01362aBf156D7ecf6159528";
  const feedAddressBtcUsdV2 = "0x007A22900a3B98143368Bd5906f8E17e9867581b";
  // Accounts
  let account1: Signer;
  let account2: Signer;
  // Contract
  let contract: BetChecker;

  before(async function () {
    // Init accounts
    [account1, account2] = await ethers.getSigners();
    // Deploy contract
    contract = await new BetChecker__factory(account1).deploy();
  });

  it("Should add and update feed addresses", async function () {
    // Add addresses by owner
    await expect(
      contract
        .connect(account1)
        .setFeedAddresses(
          [feedSymbolEthUsd, feedSymbolBtcUsd],
          [feedAddressEthUsd, feedAddressBtcUsdV1]
        )
    ).to.be.not.reverted;
    // Add addresses by not owner
    await expect(
      contract
        .connect(account2)
        .setFeedAddresses(
          [feedSymbolEthUsd, feedSymbolBtcUsd],
          [feedAddressEthUsd, feedAddressBtcUsdV1]
        )
    ).to.be.revertedWith("Ownable: caller is not the owner");
    // Check addresses
    expect(await contract.getFeedAddress(feedSymbolEthUsd)).to.be.equal(
      feedAddressEthUsd
    );
    expect(await contract.getFeedAddress(feedSymbolBtcUsd)).to.be.equal(
      feedAddressBtcUsdV1
    );
  });

  it("Should update feed address", async function () {
    // Check address before
    expect(await contract.getFeedAddress(feedSymbolBtcUsd)).to.be.equal(
      feedAddressBtcUsdV1
    );
    // Update address by owner
    await expect(
      contract
        .connect(account1)
        .setFeedAddress(feedSymbolBtcUsd, feedAddressBtcUsdV2)
    ).to.be.not.reverted;
    // Update address by not owner
    await expect(
      contract
        .connect(account2)
        .setFeedAddress(feedSymbolBtcUsd, feedAddressBtcUsdV2)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    // Check address before
    expect(await contract.getFeedAddress(feedSymbolBtcUsd)).to.be.equal(
      feedAddressBtcUsdV2
    );
  });
});

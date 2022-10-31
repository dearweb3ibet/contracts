import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("BetChecker", function () {
  // Constants
  const feedSymbolEthUsd = "ETHUSD";
  const feedSymbolBtcUsd = "BTCUSD";
  const feedAddressEthUsd = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
  const feedAddressBtcUsdOne = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
  const feedAddressBtcUsdTwo = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
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
      .getContractFactory("BetChecker")
      .then((factory) =>
        factory.deploy(
          [feedSymbolEthUsd, feedSymbolBtcUsd],
          [feedAddressEthUsd, feedAddressBtcUsdOne]
        )
      );
  });

  it("Should recheck feed address", async function () {
    // Check address before
    expect(await contract.getFeedAddress(feedSymbolBtcUsd)).to.equal(
      feedAddressBtcUsdOne
    );
    // Update address
    await contract.setFeedAddress(feedSymbolBtcUsd, feedAddressBtcUsdTwo);
    // Check address after
    expect(await contract.getFeedAddress(feedSymbolBtcUsd)).to.equal(
      feedAddressBtcUsdTwo
    );
  });
});

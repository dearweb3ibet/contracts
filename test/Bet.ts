import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe.only("Bet", function () {
  // Accounts
  let account1: Signer;
  let account2: Signer;
  // Contracts
  let betCheckerContract: Contract;
  let betContract: Contract;
  // Helpful variables
  let lastTokenId = 0;

  before(async function () {
    // Init accounts
    [account1, account2] = await ethers.getSigners();
    // Deploy contracts
    betCheckerContract = await ethers
      .getContractFactory("BetChecker")
      .then((factory) => factory.deploy());
    betContract = await ethers
      .getContractFactory("Bet")
      .then((factory) => factory.deploy(betCheckerContract.address));
  });

  it.only("Should check bet checker", async function () {
    // Check bet checker contract
    expect(await betContract.getBetCheckerAddress()).to.equal(
      betCheckerContract.address
    );
    expect(await betContract.getBetCheckerTestString()).to.equal(
      "HELLO_WORLD!"
    );
  });

  it("Should create and accept bet", async function () {
    // Create bet
    const uri = "";
    const minPrice = 1000;
    const maxPrice = 1200;
    const dayStartTimestamp = 1667088000;
    const rate = "0.01";
    await expect(
      betContract
        .connect(account1)
        .create(
          uri,
          minPrice,
          maxPrice,
          dayStartTimestamp,
          ethers.utils.parseEther(rate),
          {
            value: ethers.utils.parseEther(rate),
          }
        )
    ).to.changeEtherBalance(
      account1,
      ethers.utils.parseEther(rate).mul(BigInt("-1"))
    );
    lastTokenId += 1;
    // Accept bet
    const tokenId = lastTokenId;
    await expect(
      betContract.connect(account2).accept(tokenId, {
        value: ethers.utils.parseEther(rate),
      })
    ).to.changeEtherBalance(
      account2,
      ethers.utils.parseEther(rate).mul(BigInt("-1"))
    );
    // Check bet params
    const tokenParams = await betContract.getParams(lastTokenId);
    expect(tokenParams.minPrice).to.equal(BigNumber.from(minPrice));
    expect(tokenParams.maxPrice).to.equal(BigNumber.from(maxPrice));
    expect(tokenParams.dayStartTimestamp).to.equal(
      BigNumber.from(dayStartTimestamp)
    );
    expect(tokenParams.rate).to.equal(ethers.utils.parseEther(rate));
    expect(tokenParams.firstMember).to.equal(await account1.getAddress());
    expect(tokenParams.secondMember).to.equal(await account2.getAddress());
  });
});

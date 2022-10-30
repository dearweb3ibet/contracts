import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe.only("Bet", function () {
  // Accounts
  let account1: Signer;
  let account2: Signer;
  // Contract
  let contract: Contract;
  // Helpful variables
  let lastTokenId = 0;

  before(async function () {
    // Init accounts
    [account1, account2] = await ethers.getSigners();
    // Deploy contract
    contract = await ethers
      .getContractFactory("Bet")
      .then((factory) => factory.deploy());
  });

  it("Should create and accept bet", async function () {
    // Create bet
    const uri = "";
    const minPrice = 1000;
    const maxPrice = 1200;
    const dayStartTimestamp = 1667088000;
    const rate = "0.01";
    await expect(
      contract
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
      contract.connect(account2).accept(tokenId, {
        value: ethers.utils.parseEther(rate),
      })
    ).to.changeEtherBalance(
      account2,
      ethers.utils.parseEther(rate).mul(BigInt("-1"))
    );
    // Check bet params
    const tokenParams = await contract.getParams(lastTokenId);
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

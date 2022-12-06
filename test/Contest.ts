import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Contest", function () {
  // Constants
  const contestBalance = BigNumber.from("100000000000000000");
  const contestWinnersNumber = 3;
  const contestWinningValue = contestBalance.div(
    BigNumber.from(contestWinnersNumber)
  );
  // Accounts
  let accounts: Array<Signer>;
  // Contracts
  let contestContract: Contract;

  before(async function () {
    // Init accounts
    accounts = await ethers.getSigners();
    // Init contracts
    contestContract = await ethers
      .getContractFactory("Contest")
      .then((factory) => factory.deploy(contestWinnersNumber));
  });

  it("Should send winnings", async function () {
    // Send ethers to contest contract
    await accounts[0].sendTransaction({
      to: contestContract.address,
      value: ethers.utils.parseEther("0.1"),
    });
    // Send winnings
    await expect(
      contestContract
        .connect(accounts[0])
        .sendWinnings([
          await accounts[1].getAddress(),
          await accounts[2].getAddress(),
          await accounts[3].getAddress(),
        ])
    ).to.changeEtherBalances(
      [
        contestContract.address,
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
      ],
      [
        contestWinningValue
          .mul(contestWinnersNumber)
          .mul(ethers.constants.NegativeOne),
        contestWinningValue,
        contestWinningValue,
        contestWinningValue,
      ]
    );
  });
});

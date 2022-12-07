import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Contest", function () {
  // Constants
  const contestBalance = BigNumber.from("100000000000000000");
  const contestWaveEndTimestamp = 1673049600;
  const contestWaveWinnersNumber = 3;
  const contestWinningValue = contestBalance.div(
    BigNumber.from(contestWaveWinnersNumber)
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
      .then((factory) => factory.deploy());
  });

  it("Should start and close wave", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(accounts[0])
        .startWave(contestWaveEndTimestamp, contestWaveWinnersNumber)
    ).to.be.not.reverted;
    // Start wave (second try)
    await expect(
      contestContract
        .connect(accounts[0])
        .startWave(contestWaveEndTimestamp, contestWaveWinnersNumber)
    ).to.be.revertedWith("last wave is not closed");
    // Send ethers to contest contract
    await expect(
      accounts[0].sendTransaction({
        to: contestContract.address,
        value: contestBalance,
      })
    ).to.changeEtherBalances(
      [accounts[0], contestContract.address],
      [contestBalance.mul(ethers.constants.NegativeOne), contestBalance]
    );
    // Close wave
    await expect(
      contestContract
        .connect(accounts[0])
        .closeLastWave([
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
          .mul(contestWaveWinnersNumber)
          .mul(ethers.constants.NegativeOne),
        contestWinningValue,
        contestWinningValue,
        contestWinningValue,
      ]
    );
    // Close wave (second try)
    await expect(
      contestContract
        .connect(accounts[0])
        .closeLastWave([
          await accounts[1].getAddress(),
          await accounts[2].getAddress(),
          await accounts[3].getAddress(),
        ])
    ).to.be.revertedWith("last wave is already closed");
  });
});

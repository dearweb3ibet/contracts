import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import { Contest, Contest__factory } from "../../typechain-types";

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
  let contestContract: Contest;

  before(async function () {
    // Init accounts
    accounts = await ethers.getSigners();
    // Init contracts
    contestContract = await new Contest__factory(accounts[0]).deploy();
    await contestContract.initialize();
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
    ).to.be.revertedWith("Last wave is not closed");
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
    // Check last wave id
    const lastWaveId = await contestContract
      .connect(accounts[0])
      .getCurrentCounter();
    expect(lastWaveId).to.equal(BigNumber.from(1));
    // Close wave
    await expect(
      contestContract
        .connect(accounts[0])
        .closeWave(lastWaveId, [
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
        .closeWave(lastWaveId, [
          await accounts[1].getAddress(),
          await accounts[2].getAddress(),
          await accounts[3].getAddress(),
        ])
    ).to.be.revertedWith("Wave is already closed");
  });
});

import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  contestContract,
  contestWaveParams,
  deployer,
  makeSuiteCleanRoom,
  userOneAddress,
  userThreeAddress,
  userTwoAddress,
} from "../setup";

makeSuiteCleanRoom("Contest", function () {
  beforeEach(async function () {
    // Close last wave
    const lastWaveId = await contestContract.getCurrentCounter();
    await contestContract
      .connect(deployer)
      .closeWave(lastWaveId, [
        userOneAddress,
        userTwoAddress,
        userThreeAddress,
      ]);
  });

  it("Deployer should fail close already closed last wave", async function () {
    // Check last wave
    const lastWaveId = await contestContract.getCurrentCounter();
    const wave = await contestContract.getWave(lastWaveId);
    expect(wave.closeTimestamp).to.be.not.eq(ethers.constants.Zero);
    // Close wave
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(lastWaveId, [
          userOneAddress,
          userTwoAddress,
          userThreeAddress,
        ])
    ).to.be.revertedWith("Wave is already closed");
  });

  it("Deployer should be able to start wave and fail to start wave again", async function () {
    // First try to start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.two.endTimestamp,
          contestWaveParams.two.winnersNumber
        )
    ).to.be.not.reverted;
    // Second try to start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.two.endTimestamp,
          contestWaveParams.two.winnersNumber
        )
    ).to.be.revertedWith("Last wave is not closed");
  });

  it("Deployer should be able to start and close wave and winners should receive winnings", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.two.endTimestamp,
          contestWaveParams.two.winnersNumber
        )
    ).to.be.not.reverted;
    // Define last wave id
    const lastWaveId = await contestContract.getCurrentCounter();
    // Define contest distibution
    const contestBalance = BigNumber.from("100000000000000000");
    const contestWinningValue = contestBalance.div(
      BigNumber.from(contestWaveParams.two.winnersNumber)
    );
    // Send ethers to contest contract
    await deployer.sendTransaction({
      to: contestContract.address,
      value: contestBalance,
    });
    // Close wave
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(lastWaveId, [userOneAddress, userTwoAddress])
    ).to.changeEtherBalances(
      [contestContract.address, userOneAddress, userTwoAddress],
      [
        contestWinningValue
          .mul(contestWaveParams.two.winnersNumber)
          .mul(ethers.constants.NegativeOne),
        contestWinningValue,
        contestWinningValue,
      ]
    );
  });
});

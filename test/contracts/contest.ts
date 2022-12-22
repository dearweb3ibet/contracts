import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  contestContract,
  contestWaveParams,
  deployer,
  userOneAddress,
  userThreeAddress,
  userTwoAddress,
} from "../setup";

describe("Contest", function () {
  it("Deployer should be able to close last wave and fail to close last wave again", async function () {
    // Check last wave
    const lastWaveId = await contestContract.getCurrentCounter();
    let wave = await contestContract.getWave(lastWaveId);
    expect(wave.closeTimestamp).to.be.eq(ethers.constants.Zero);
    // Close wave (first try)
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(lastWaveId, [
          userOneAddress,
          userTwoAddress,
          userThreeAddress,
        ])
    ).to.be.not.reverted;
    // Close wave (second try)
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(lastWaveId, [
          userOneAddress,
          userTwoAddress,
          userThreeAddress,
        ])
    ).to.be.revertedWith("Wave is already closed");
    // Check last wave
    const waveAfter = await contestContract.getWave(lastWaveId);
    expect(waveAfter.closeTimestamp).to.be.not.eq(ethers.constants.Zero);
  });

  it("Deployer should be able to start and close wave and winners should receive winnings", async function () {
    // Check last wave
    let lastWaveId = await contestContract.getCurrentCounter();
    const wave = await contestContract.getWave(lastWaveId);
    expect(wave.closeTimestamp).to.be.not.eq(ethers.constants.Zero);
    // Start wave (first try)
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.two.endTimestamp,
          contestWaveParams.two.winnersNumber
        )
    ).to.be.not.reverted;
    // Start wave (second try)
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.two.endTimestamp,
          contestWaveParams.two.winnersNumber
        )
    ).to.be.revertedWith("Last wave is not closed");
    // Update last wave id
    lastWaveId = await contestContract.getCurrentCounter();
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

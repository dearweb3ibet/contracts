import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SECONDS_PER_DAY } from "../../helpers/constants";
import {
  contestContract,
  contestWaveParams,
  deployer,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Contest Wave Closing", function () {
  it("User should fail to close wave", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.not.reverted;
    // Define last wave id
    const lastWaveId = await contestContract.getCurrentCounter();
    // Close wave by user
    await expect(
      contestContract
        .connect(userOne)
        .closeWave(lastWaveId, [userOneAddress, userTwoAddress])
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deployer should fail to close already closed last wave", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.not.reverted;
    // Define last wave id
    const lastWaveId = await contestContract.getCurrentCounter();
    // Increase network time
    await time.increase(4 * SECONDS_PER_DAY);
    // Close wave (try one)
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(lastWaveId, [userOneAddress, userTwoAddress])
    ).to.be.not.reverted;
    // Close wave (try two)
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(lastWaveId, [userOneAddress, userTwoAddress])
    ).to.be.revertedWith("Wave is already closed");
  });

  it("Deployer should fail to close wave with end timestamp that has not come", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.not.reverted;
    // Define last wave id
    const lastWaveId = await contestContract.getCurrentCounter();
    // Close wave
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(lastWaveId, [userOneAddress, userTwoAddress])
    ).to.be.revertedWith("Wave end timestamp has not come");
  });

  it("Deployer should be able close wave and winners should receive winnings", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.not.reverted;
    // Define last wave id
    const lastWaveId = await contestContract.getCurrentCounter();
    // Define contest distibution
    const contestBalance = BigNumber.from("100000000000000000");
    const contestWinningValue = contestBalance.div(
      BigNumber.from(contestWaveParams.one.winnersNumber)
    );
    // Send ethers to contest contract
    await deployer.sendTransaction({
      to: contestContract.address,
      value: contestBalance,
    });
    // Increase network time
    await time.increase(4 * SECONDS_PER_DAY);
    // Close wave
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(lastWaveId, [userOneAddress, userTwoAddress])
    ).to.changeEtherBalances(
      [contestContract.address, userOneAddress, userTwoAddress],
      [
        contestWinningValue
          .mul(contestWaveParams.one.winnersNumber)
          .mul(ethers.constants.NegativeOne),
        contestWinningValue,
        contestWinningValue,
      ]
    );
    // Check last wave
    const lastWave = await contestContract.getWave(lastWaveId);
    expect(lastWave.closeTimestamp).to.be.not.eq(ethers.constants.Zero);
  });
});

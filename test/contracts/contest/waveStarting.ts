import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { SECONDS_PER_DAY } from "../../helpers/constants";
import {
  contestContract,
  contestWaveParams,
  deployer,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
  userThreeAddress,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Contest Wave Starting", function () {
  beforeEach(async function () {
    // Increase network time
    await time.increase(2 * SECONDS_PER_DAY);
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

  it("User should fail to start wave", async function () {
    await expect(
      contestContract
        .connect(userOne)
        .startWave(
          contestWaveParams.two.endTimestamp,
          contestWaveParams.two.winnersNumber
        )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deployer should fail to start wave twice", async function () {
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
});

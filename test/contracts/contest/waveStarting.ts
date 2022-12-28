import { expect } from "chai";
import {
  contestContract,
  contestWaveParams,
  deployer,
  makeSuiteCleanRoom,
  userOne,
} from "../../setup";

makeSuiteCleanRoom("Contest Wave Starting", function () {
  it("User should fail to start wave", async function () {
    await expect(
      contestContract
        .connect(userOne)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deployer should fail to start wave twice", async function () {
    // First try to start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.not.reverted;
    // Second try to start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.revertedWith("Last wave is not closed");
  });
});

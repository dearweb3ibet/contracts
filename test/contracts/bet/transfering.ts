import { expect } from "chai";
import {
  betContract,
  betParams,
  betParticipantFees,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Bet Transfering", function () {
  it("User should fail to transfer token", async function () {
    // Create bet
    await expect(
      betContract
        .connect(userOne)
        .create(
          betParams.one.uri,
          betParticipantFees.eth01,
          betParams.one.symbol,
          betParams.one.targetMinPrice,
          betParams.one.targetMaxPrice,
          betParams.one.targetTimestamp,
          betParams.one.participationDeadlineTimestamp,
          {
            value: betParticipantFees.eth01,
          }
        )
    ).to.be.not.reverted;
    // Get created bet id
    const createdBetId = await betContract.connect(userOne).getCurrentCounter();
    // Transfer
    await expect(
      betContract
        .connect(userOne)
        .transferFrom(userOneAddress, userTwoAddress, createdBetId)
    ).to.be.revertedWith("Token is non-transferable");
  });
});

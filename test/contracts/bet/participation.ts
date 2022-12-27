import { expect } from "chai";
import { ethers } from "hardhat";
import {
  betContract,
  betParams,
  betParticipantFees,
  makeSuiteCleanRoom,
  userOne,
  userThree,
  userTwo,
} from "../../setup";

makeSuiteCleanRoom("Bet Participation", function () {
  it("User should fail to take part in a closed bet", async function () {
    // Create bet by user one
    await expect(
      betContract
        .connect(userOne)
        .create(
          betParams.one.uri,
          betParticipantFees.eth005,
          betParams.one.symbol,
          betParams.one.targetMinPrice,
          betParams.one.targetMaxPrice,
          betParams.one.targetTimestamp,
          betParams.one.participationDeadlineTimestamp,
          {
            value: betParticipantFees.eth005,
          }
        )
    ).to.be.not.reverted;
    // Get created bet id
    const createdBetId = await betContract.connect(userOne).getCurrentCounter();
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.be.not.reverted;
    // Take part by user two
    await expect(
      betContract
        .connect(userTwo)
        .takePart(createdBetId, betParticipantFees.eth005, false, {
          value: betParticipantFees.eth005,
        })
    ).to.be.revertedWith("Bet is closed");
  });

  it("User should be able to take part in a bet", async function () {
    // Define fees
    const userOneFee = betParticipantFees.eth005;
    const userTwoFee = betParticipantFees.eth01;
    const userThreeFee = betParticipantFees.eth003;
    // Create bet by user one
    await expect(
      betContract
        .connect(userOne)
        .create(
          betParams.one.uri,
          userOneFee,
          betParams.one.symbol,
          betParams.one.targetMinPrice,
          betParams.one.targetMaxPrice,
          betParams.one.targetTimestamp,
          betParams.one.participationDeadlineTimestamp,
          {
            value: userOneFee,
          }
        )
    ).to.be.not.reverted;
    // Get created bet id
    const createdBetId = await betContract.connect(userOne).getCurrentCounter();
    // Take part in bet by user two
    const txOne = betContract
      .connect(userTwo)
      .takePart(createdBetId, userTwoFee, false, {
        value: userTwoFee,
      });
    await expect(txOne).to.be.not.reverted;
    await expect(txOne).to.changeEtherBalance(
      userTwo,
      userTwoFee.mul(ethers.constants.NegativeOne)
    );
    // Take part in bet by user three
    const txTwo = betContract
      .connect(userThree)
      .takePart(createdBetId, userThreeFee, true, {
        value: userThreeFee,
      });
    await expect(txTwo).to.be.not.reverted;
    await expect(txTwo).to.changeEtherBalance(
      userThree,
      userThreeFee.mul(ethers.constants.NegativeOne)
    );
    // Check bet params
    const params = await betContract.getParams(createdBetId);
    expect(params.feeForSuccess).to.equal(userOneFee.add(userThreeFee));
    expect(params.feeForFailure).to.equal(userTwoFee);
    // Check bet participants
    const participants = await betContract.getParticipants(createdBetId);
    expect(participants.length).to.equal(3);
  });
});

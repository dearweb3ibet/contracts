import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SECONDS_PER_DAY } from "../../helpers/constants";
import {
  betContract,
  betContractParams,
  betParams,
  betParticipantFees,
  contestContract,
  makeSuiteCleanRoom,
  usageContract,
  userOne,
  userOneAddress,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Bet Closing", function () {
  it("User should fail to close a bet with not expired target timestamp", async function () {
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
    ).to.be.revertedWith("Target timestamp has not come");
  });

  it("User should be able to close a failed bet with one participant and participant should receive contest points", async function () {
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
    // Increase network time
    await time.increase(2 * SECONDS_PER_DAY);
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.be.not.reverted;
    // Check contest wave participants
    const contestLastWaveId = await contestContract.getCurrentCounter();
    const contestParticipants = await contestContract.getWaveParticipants(
      contestLastWaveId
    );
    for (let contestParticipant of contestParticipants) {
      if (contestParticipant.accountAddress === userOneAddress) {
        expect(contestParticipant.successes).be.eq(BigNumber.from(0));
        expect(contestParticipant.failures).be.eq(BigNumber.from(1));
        expect(contestParticipant.variance).to.be.eq(BigNumber.from(-1));
      }
    }
  });

  it("User should be able to close a failed bet with four participants and participants should receive winnings and contest points", async function () {
    // Define fees and distributions
    const userOneFee = betParticipantFees.eth005;
    const userTwoFee = betParticipantFees.eth01;
    const userThreeFee = betParticipantFees.eth003;
    const feeForSuccess = userOneFee;
    const feeForFailure = userTwoFee.add(userThreeFee);
    const feeForContest = feeForSuccess
      .mul(betContractParams.contestFeePercent)
      .div(BigNumber.from(100));
    const feeForUsage = feeForSuccess
      .mul(betContractParams.usageFeePercent)
      .div(BigNumber.from(100));
    const feeForWinners = feeForSuccess.sub(feeForContest).sub(feeForUsage);
    const userTwoWinning = userTwoFee.mul(feeForWinners).div(feeForFailure);
    const userThreeWinning = userThreeFee.mul(feeForWinners).div(feeForFailure);
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
    await expect(
      betContract.connect(userTwo).takePart(createdBetId, userTwoFee, false, {
        value: userTwoFee,
      })
    ).to.be.not.reverted;
    // Take part in bet by user three
    await expect(
      betContract
        .connect(userThree)
        .takePart(createdBetId, userThreeFee, false, {
          value: userThreeFee,
        })
    ).to.be.not.reverted;
    // Increase network time
    await time.increase(2 * SECONDS_PER_DAY);
    // Close bet
    const tx = betContract.connect(userOne).close(createdBetId);
    await expect(tx).to.be.not.reverted;
    await expect(tx).to.changeEtherBalances(
      [
        userOne,
        userTwo,
        userThree,
        betContract.address,
        contestContract.address,
        usageContract.address,
      ],
      [
        ethers.constants.Zero,
        userTwoFee.add(userTwoWinning),
        userThreeFee.add(userThreeWinning),
        userTwoFee
          .add(userTwoWinning)
          .add(userThreeFee)
          .add(userThreeWinning)
          .add(feeForContest)
          .add(feeForUsage)
          .mul(ethers.constants.NegativeOne),
        feeForContest,
        feeForUsage,
      ]
    );
    // Check contest wave participants
    const contestLastWaveId = await contestContract.getCurrentCounter();
    const contestParticipants = await contestContract.getWaveParticipants(
      contestLastWaveId
    );
    for (let contestParticipant of contestParticipants) {
      if (contestParticipant.accountAddress === userOneAddress) {
        expect(contestParticipant.successes).be.eq(BigNumber.from(0));
        expect(contestParticipant.failures).be.eq(BigNumber.from(1));
        expect(contestParticipant.variance).to.be.eq(BigNumber.from(-1));
      }
      if (contestParticipant.accountAddress === userTwoAddress) {
        expect(contestParticipant.successes).be.eq(BigNumber.from(1));
        expect(contestParticipant.failures).be.eq(BigNumber.from(0));
        expect(contestParticipant.variance).to.be.eq(BigNumber.from(1));
      }
      if (contestParticipant.accountAddress === userThreeAddress) {
        expect(contestParticipant.successes).be.eq(BigNumber.from(1));
        expect(contestParticipant.failures).be.eq(BigNumber.from(0));
        expect(contestParticipant.variance).to.be.eq(BigNumber.from(1));
      }
    }
  });
});

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
  deployer,
  makeSuiteCleanRoom,
  mockBetCheckerContract,
  usageContract,
  userOne,
  userOneAddress,
  userThree,
  userTwo,
} from "../../setup";

makeSuiteCleanRoom("Bet Closing", function () {
  it("User should fail to close a bet when no more than 24 hours have passed since target timestamp", async function () {
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
    ).to.be.revertedWith("Must be more than 24 hours after target timestamp");
  });

  it("User should be able to close a failed bet with one participant and participant should receive contest points", async function () {
    // Define fees
    const userOneFee = betParticipantFees.eth005;
    const feeForContest = userOneFee
      .mul(betContractParams.contestFeePercent)
      .div(BigNumber.from(100));
    const feeForUsage = userOneFee
      .mul(betContractParams.usageFeePercent)
      .div(BigNumber.from(100));
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
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.changeEtherBalances(
      [
        userOneAddress,
        betContract.address,
        contestContract.address,
        usageContract.address,
      ],
      [
        ethers.constants.Zero,
        feeForContest.add(feeForUsage).mul(ethers.constants.NegativeOne),
        feeForContest,
        feeForUsage,
      ]
    );
  });

  it("User should be able to close a successed bet with one participant and participant should get back fee and receive contest points", async function () {
    // Make mock bet checker contract positive
    await mockBetCheckerContract.connect(deployer).setIsPositive(true);
    // Define fees
    const userOneFee = betParticipantFees.eth005;
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
    // Increase network time
    await time.increase(3 * SECONDS_PER_DAY);
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.changeEtherBalances(
      [
        userOneAddress,
        betContract.address,
        contestContract.address,
        usageContract.address,
      ],
      [
        userOneFee,
        userOneFee.mul(ethers.constants.NegativeOne),
        ethers.constants.Zero,
        ethers.constants.Zero,
      ]
    );
  });

  it("User should be able to close a failed bet with three participants and participants should receive winning and contest points", async function () {
    // Define fees
    const userOneFee = betParticipantFees.eth005;
    const userTwoFee = betParticipantFees.eth01;
    const userThreeFee = betParticipantFees.eth003;
    const feeFromLosers = userOneFee;
    const feeFromWinners = userTwoFee.add(userThreeFee);
    const feeForContest = feeFromLosers
      .mul(betContractParams.contestFeePercent)
      .div(BigNumber.from(100));
    const feeForUsage = feeFromLosers
      .mul(betContractParams.usageFeePercent)
      .div(BigNumber.from(100));
    const feeForWinnings = feeFromLosers.sub(feeForContest).sub(feeForUsage);
    const userTwoWinning = userTwoFee.mul(feeForWinnings).div(feeFromWinners);
    const userThreeWinning = userThreeFee
      .mul(feeForWinnings)
      .div(feeFromWinners);
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
    await time.increase(3 * SECONDS_PER_DAY);
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.changeEtherBalances(
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
  });

  it("User should be able to close a failed bet with three participants and participants should receive winning and contest points", async function () {
    // Make mock bet checker contract positive
    await mockBetCheckerContract.connect(deployer).setIsPositive(true);
    // Define fees
    const userOneFee = betParticipantFees.eth005;
    const userTwoFee = betParticipantFees.eth01;
    const userThreeFee = betParticipantFees.eth003;
    const feeFromLosers = userTwoFee.add(userThreeFee);
    const feeForContest = feeFromLosers
      .mul(betContractParams.contestFeePercent)
      .div(BigNumber.from(100));
    const feeForUsage = feeFromLosers
      .mul(betContractParams.usageFeePercent)
      .div(BigNumber.from(100));
    const feeForWinnings = feeFromLosers.sub(feeForContest).sub(feeForUsage);
    const userOneWinning = feeForWinnings;
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
    await time.increase(3 * SECONDS_PER_DAY);
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.changeEtherBalances(
      [
        userOne,
        userTwo,
        userThree,
        betContract.address,
        contestContract.address,
        usageContract.address,
      ],
      [
        userOneFee.add(userOneWinning),
        ethers.constants.Zero,
        ethers.constants.Zero,
        userOneFee
          .add(userOneWinning)
          .add(feeForContest)
          .add(feeForUsage)
          .mul(ethers.constants.NegativeOne),
        feeForContest,
        feeForUsage,
      ]
    );
  });
});

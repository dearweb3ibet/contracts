import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  betContract,
  betContractParams,
  betParams,
  betParticipantFees,
  contestContract,
  deployer,
  makeSuiteCleanRoom,
  usageContract,
  userOne,
  userOneAddress,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../setup";

makeSuiteCleanRoom("Bet", function () {
  it("User should fail to create a bet without message value", async function () {
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
          betParams.one.participationDeadlineTimestamp
        )
    ).to.be.revertedWith("Fee must equal to message value");
  });

  it("User should fail to create a bet with zero fee", async function () {
    await expect(
      betContract
        .connect(userOne)
        .create(
          betParams.one.uri,
          betParticipantFees.eth0,
          betParams.one.symbol,
          betParams.one.targetMinPrice,
          betParams.one.targetMaxPrice,
          betParams.one.targetTimestamp,
          betParams.one.participationDeadlineTimestamp,
          {
            value: betParticipantFees.eth0,
          }
        )
    ).to.be.revertedWith("Fee must be greater than zero");
  });

  it("User should fail to create a bet with incorrect prices", async function () {
    const incorrectTargetMinPrice = BigNumber.from(2000);
    const incorrectTargetMaxPrice = BigNumber.from(1000);
    await expect(
      betContract
        .connect(userOne)
        .create(
          betParams.one.uri,
          betParticipantFees.eth005,
          betParams.one.symbol,
          incorrectTargetMinPrice,
          incorrectTargetMaxPrice,
          betParams.one.targetTimestamp,
          betParams.one.participationDeadlineTimestamp,
          {
            value: betParticipantFees.eth005,
          }
        )
    ).to.be.revertedWith("Max price must be greater than min price");
  });

  it("User should fail to create a bet with incorrect target timestamp", async function () {
    const incorrectTargetTimestamp = BigNumber.from("1672041600");
    await expect(
      betContract
        .connect(userOne)
        .create(
          betParams.one.uri,
          betParticipantFees.eth005,
          betParams.one.symbol,
          betParams.one.targetMinPrice,
          betParams.one.targetMaxPrice,
          incorrectTargetTimestamp,
          betParams.one.participationDeadlineTimestamp,
          {
            value: betParticipantFees.eth005,
          }
        )
    ).to.be.revertedWith("Must be more than 24 hours before target timestamp");
  });

  it("User should fail to create a bet with incorrect participation deadline timestamp", async function () {
    const incorrectParticipationDeadlineTimestamp =
      BigNumber.from("1672041600");
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
          incorrectParticipationDeadlineTimestamp,
          {
            value: betParticipantFees.eth005,
          }
        )
    ).to.be.revertedWith(
      "Must be more than 8 hours before participation deadline"
    );
  });

  it("User should fail to create a bet with not supported symbol", async function () {
    const notSupportedSymbol = "MATICUSD";
    await expect(
      betContract
        .connect(userOne)
        .create(
          betParams.one.uri,
          betParticipantFees.eth005,
          notSupportedSymbol,
          betParams.one.targetMinPrice,
          betParams.one.targetMaxPrice,
          betParams.one.targetTimestamp,
          betParams.one.participationDeadlineTimestamp,
          {
            value: betParticipantFees.eth005,
          }
        )
    ).to.be.revertedWith("Symbol is not supported");
  });

  it("User should be able to create a bet", async function () {
    // Create bet
    const tx = betContract
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
      );
    await expect(tx).to.be.not.reverted;
    await expect(tx).to.changeEtherBalances(
      [userOne, betContract.address],
      [
        betParticipantFees.eth005.mul(ethers.constants.NegativeOne),
        betParticipantFees.eth005,
      ]
    );
    // Get created bet id
    const createdBetId = await betContract.connect(userOne).getCurrentCounter();
    // Check bet params
    const params = await betContract.getParams(createdBetId);
    expect(params.creatorAddress).to.equal(userOneAddress);
    expect(params.creatorFee).to.equal(betParticipantFees.eth005);
    expect(params.symbol).to.equal(betParams.one.symbol);
    expect(params.targetMinPrice).to.equal(betParams.one.targetMinPrice);
    expect(params.targetMaxPrice).to.equal(betParams.one.targetMaxPrice);
    expect(params.targetTimestamp).to.equal(betParams.one.targetTimestamp);
    // Check bet participants
    const participants = await betContract.getParticipants(createdBetId);
    const firstParticipant = participants[0];
    expect(participants.length).to.equal(1);
    expect(firstParticipant.accountAddress).to.equal(userOneAddress);
    expect(firstParticipant.fee).to.equal(betParticipantFees.eth005);
    expect(firstParticipant.isFeeForSuccess).to.equal(true);
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

  it("User should be able to close a bet and participants should receive contest points", async function () {
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

  it("User should fail to create a bet if contract is paused", async function () {
    // Pause contract
    expect(await betContract.paused()).to.be.eq(false);
    await expect(betContract.connect(deployer).pause()).to.be.not.reverted;
    expect(await betContract.paused()).to.be.eq(true);
    // Create bet
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
    ).to.be.revertedWith("Pausable: paused");
  });

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

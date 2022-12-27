import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  betContract,
  betParams,
  betParticipantFees,
  deployer,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
} from "../../setup";

makeSuiteCleanRoom("Bet Creation", function () {
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
});

import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from "../../helpers/constants";
import {
  betContract,
  betParams,
  betParticipantFees,
  contestContract,
  contestWaveParams,
  deployer,
  makeSuiteCleanRoom,
  userOne,
  userOneAddress,
  userThree,
  userThreeAddress,
  userTwo,
  userTwoAddress,
} from "../../setup";

makeSuiteCleanRoom("Contest Closed Bet Processing", function () {
  it("User should fail to use function to process closed bet participatns", async function () {
    await expect(
      contestContract.connect(userOne).processClosedBetParticipants([])
    ).to.be.revertedWith("Only bet contract can be sender");
  });

  it("Contest contract with closed last wave should not update last wave participants after closing bet", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.two.endTimestamp,
          contestWaveParams.two.winnersNumber
        )
    ).to.be.not.reverted;
    // Define last wave id
    const contestLastWaveId = await contestContract.getCurrentCounter();
    // Increase network time to close wave
    await time.increase(2 * SECONDS_PER_HOUR);
    // Close wave
    await expect(
      contestContract
        .connect(deployer)
        .closeWave(contestLastWaveId, [ethers.constants.AddressZero])
    ).to.be.not.reverted;
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
    // Define created bet id
    const createdBetId = await betContract.connect(userOne).getCurrentCounter();
    // Increase network time to close bet
    await time.increase(2 * SECONDS_PER_DAY);
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.be.not.reverted;
    // Check last wave participants
    const contestWaveParticipants = await contestContract.getWaveParticipants(
      contestLastWaveId
    );
    expect(contestWaveParticipants.length).to.be.eq(0);
  });

  it("Contest contract should update last wave participants after closing bet with one participant", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.not.reverted;
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
    // Increase network time to close bet
    await time.increase(2 * SECONDS_PER_DAY);
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.be.not.reverted;
    // Get last wave participants
    const contestLastWaveId = await contestContract.getCurrentCounter();
    const contestWaveParticipants = await contestContract.getWaveParticipants(
      contestLastWaveId
    );
    // Check user one
    expect(contestWaveParticipants[0].accountAddress).be.eq(userOneAddress);
    expect(contestWaveParticipants[0].successes).be.eq(BigNumber.from(0));
    expect(contestWaveParticipants[0].failures).be.eq(BigNumber.from(1));
    expect(contestWaveParticipants[0].variance).be.eq(BigNumber.from(-1));
  });

  it("Contest contract should update last wave participants after closing bet with three participants", async function () {
    // Start wave
    await expect(
      contestContract
        .connect(deployer)
        .startWave(
          contestWaveParams.one.endTimestamp,
          contestWaveParams.one.winnersNumber
        )
    ).to.be.not.reverted;
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
    // Take part in bet by user two
    await expect(
      betContract
        .connect(userTwo)
        .takePart(createdBetId, betParticipantFees.eth005, false, {
          value: betParticipantFees.eth005,
        })
    ).to.be.not.reverted;
    // Take part in bet by user three
    await expect(
      betContract
        .connect(userThree)
        .takePart(createdBetId, betParticipantFees.eth005, false, {
          value: betParticipantFees.eth005,
        })
    ).to.be.not.reverted;
    // Increase network time to close bet
    await time.increase(2 * SECONDS_PER_DAY);
    // Close bet
    await expect(
      betContract.connect(userOne).close(createdBetId)
    ).to.be.not.reverted;
    // Get last wave participants
    const contestLastWaveId = await contestContract.getCurrentCounter();
    const contestWaveParticipants = await contestContract.getWaveParticipants(
      contestLastWaveId
    );
    // Check user one
    expect(contestWaveParticipants[0].accountAddress).be.eq(userOneAddress);
    expect(contestWaveParticipants[0].successes).be.eq(BigNumber.from(0));
    expect(contestWaveParticipants[0].failures).be.eq(BigNumber.from(1));
    expect(contestWaveParticipants[0].variance).be.eq(BigNumber.from(-1));
    // Check user two
    expect(contestWaveParticipants[1].accountAddress).be.eq(userTwoAddress);
    expect(contestWaveParticipants[1].successes).be.eq(BigNumber.from(1));
    expect(contestWaveParticipants[1].failures).be.eq(BigNumber.from(0));
    expect(contestWaveParticipants[1].variance).be.eq(BigNumber.from(1));
    // Check user three
    expect(contestWaveParticipants[2].accountAddress).be.eq(userThreeAddress);
    expect(contestWaveParticipants[2].successes).be.eq(BigNumber.from(1));
    expect(contestWaveParticipants[2].failures).be.eq(BigNumber.from(0));
    expect(contestWaveParticipants[2].variance).be.eq(BigNumber.from(1));
  });
});

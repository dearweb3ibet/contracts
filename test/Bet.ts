import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import {
  Bet,
  Bet__factory,
  Contest,
  Contest__factory,
  IBetChecker,
  MockBetChecker__factory,
  Usage,
  Usage__factory,
} from "../typechain-types";

describe("Bet", function () {
  // Constants
  const feedSymbolEthUsd = "ETHUSD";
  const feedAddressEthUsd = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
  const contestWaveEndTimestamp = 1672099200;
  const contestWaveWinnersNumber = 0;
  const contestFeePercent = 15;
  const usageFeePercent = 10;
  const betParams = {
    uri: "",
    symbol: "ETHUSD",
    targetMinPrice: BigNumber.from(1000),
    targetMaxPrice: BigNumber.from(1200),
    targetTimestamp: BigNumber.from(1667088000),
    participationDeadlineTimestamp: BigNumber.from(1667088000),
  };
  const betParticipants = {
    creator: {
      accountIndex: 0,
      fee: BigNumber.from("50000000000000000"),
      isFeeForSuccess: true,
    },
    second: {
      accountIndex: 1,
      fee: BigNumber.from("10000000000000000"),
      isFeeForSuccess: false,
    },
    third: {
      accountIndex: 2,
      fee: BigNumber.from("30000000000000000"),
      isFeeForSuccess: false,
    },
    fourth: {
      accountIndex: 3,
      fee: BigNumber.from("20000000000000000"),
      isFeeForSuccess: true,
    },
  };
  const betFeeForSuccess = betParticipants.creator.fee.add(
    betParticipants.fourth.fee
  );
  const betFeeForFailure = betParticipants.second.fee.add(
    betParticipants.third.fee
  );
  // Accounts
  let accounts: Array<Signer>;
  let deployer: Signer;
  // Contracts
  let betCheckerContract: IBetChecker;
  let contestContract: Contest;
  let usageContract: Usage;
  let betContract: Bet;
  // Helpful variables
  let lastTokenId = 0;

  before(async function () {
    // Init accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    // Init contracts
    betCheckerContract = await new MockBetChecker__factory(deployer).deploy();
    betCheckerContract.setFeedAddresses(
      [feedSymbolEthUsd],
      [feedAddressEthUsd]
    );
    contestContract = await new Contest__factory(deployer).deploy();
    await contestContract.startWave(
      contestWaveEndTimestamp,
      contestWaveWinnersNumber
    );
    usageContract = await new Usage__factory(deployer).deploy();
    betContract = await new Bet__factory(deployer).deploy();
    await betContract.initialize(
      betCheckerContract.address,
      contestContract.address,
      usageContract.address,
      contestFeePercent,
      usageFeePercent
    );
  });

  it("Should check bet checker", async function () {
    expect(await betContract.getBetCheckerAddress()).to.equal(
      betCheckerContract.address
    );
    expect(
      await betContract.getBetCheckerFeedAddress(feedSymbolEthUsd)
    ).to.equal(feedAddressEthUsd);
  });

  it("Should create bet", async function () {
    // Create bet
    await expect(
      betContract
        .connect(accounts[betParticipants.creator.accountIndex])
        .create(
          betParams.uri,
          betParticipants.creator.fee,
          betParams.symbol,
          betParams.targetMinPrice,
          betParams.targetMaxPrice,
          betParams.targetTimestamp,
          betParams.participationDeadlineTimestamp,
          {
            value: betParticipants.creator.fee,
          }
        )
    ).to.changeEtherBalances(
      [accounts[betParticipants.creator.accountIndex], betContract.address],
      [
        betParticipants.creator.fee.mul(ethers.constants.NegativeOne),
        betParticipants.creator.fee,
      ]
    );
    lastTokenId += 1;
    // Check bet params
    const params = await betContract.getParams(lastTokenId);
    expect(params.creatorAddress).to.equal(
      await accounts[betParticipants.creator.accountIndex].getAddress()
    );
    expect(params.creatorFee).to.equal(betParticipants.creator.fee);
    expect(params.symbol).to.equal(betParams.symbol);
    expect(params.targetMinPrice).to.equal(betParams.targetMinPrice);
    expect(params.targetMaxPrice).to.equal(betParams.targetMaxPrice);
    expect(params.targetTimestamp).to.equal(betParams.targetTimestamp);
    // Check bet participants
    const participants = await betContract.getParticipants(lastTokenId);
    const firstParticipant = participants[0];
    expect(participants.length).to.equal(1);
    expect(firstParticipant.accountAddress).to.equal(
      await accounts[betParticipants.creator.accountIndex].getAddress()
    );
    expect(firstParticipant.fee).to.equal(betParticipants.creator.fee);
    expect(firstParticipant.isFeeForSuccess).to.equal(true);
  });

  it("Should add participants", async function () {
    // Define data
    const extraParticipants = [
      betParticipants.second,
      betParticipants.third,
      betParticipants.fourth,
    ];
    // Add participants
    for (const participant of extraParticipants) {
      await expect(
        betContract
          .connect(accounts[participant.accountIndex])
          .takePart(lastTokenId, participant.fee, participant.isFeeForSuccess, {
            value: participant.fee,
          })
      ).to.changeEtherBalance(
        accounts[participant.accountIndex],
        participant.fee.mul(ethers.constants.NegativeOne)
      );
    }
    // Check bet params
    const params = await betContract.getParams(lastTokenId);
    expect(params.feeForSuccess).to.equal(betFeeForSuccess);
    expect(params.feeForFailure).to.equal(betFeeForFailure);
    // Check bet participants
    const participants = await betContract.getParticipants(lastTokenId);
    expect(participants.length).to.equal(Object.values(betParticipants).length);
    // Check first extra participant
    expect(participants[1].accountAddress).to.equal(
      await accounts[extraParticipants[0].accountIndex].getAddress()
    );
    expect(participants[1].fee).to.equal(extraParticipants[0].fee);
    expect(participants[1].isFeeForSuccess).to.equal(
      extraParticipants[0].isFeeForSuccess
    );
  });

  it("Should close bet", async function () {
    // Define data
    const feeForContest = betFeeForSuccess
      .mul(contestFeePercent)
      .div(BigNumber.from(100));
    const feeForUsage = betFeeForSuccess
      .mul(usageFeePercent)
      .div(BigNumber.from(100));
    const feeForWinners = betFeeForSuccess.sub(feeForContest).sub(feeForUsage);
    const account2Winning = betParticipants.second.fee
      .mul(feeForWinners)
      .div(betFeeForFailure);
    const account3Winning = betParticipants.third.fee
      .mul(feeForWinners)
      .div(betFeeForFailure);
    const contractBalance = betParticipants.creator.fee
      .add(betParticipants.second.fee)
      .add(betParticipants.third.fee)
      .add(betParticipants.fourth.fee);
    // Close bet and check balances
    await expect(
      betContract.connect(accounts[0]).close(lastTokenId)
    ).to.changeEtherBalances(
      [
        accounts[betParticipants.second.accountIndex],
        accounts[betParticipants.third.accountIndex],
        betContract.address,
        contestContract.address,
        usageContract.address,
      ],
      [
        betParticipants.second.fee.add(account2Winning),
        betParticipants.third.fee.add(account3Winning),
        contractBalance.mul(ethers.constants.NegativeOne),
        feeForContest,
        feeForUsage,
      ]
    );
    // Check contest wave participants
    const contestLastWaveIndex = await contestContract.getLastWaveIndex();
    const contestParticipants = await contestContract.getWaveParticipants(
      contestLastWaveIndex
    );
    // Check bet creator
    expect(contestParticipants[0].accountAddress).to.equal(
      await accounts[betParticipants.creator.accountIndex].getAddress()
    );
    expect(contestParticipants[0].successes).to.equal(
      betParticipants.creator.isFeeForSuccess ? 0 : 1
    );
    expect(contestParticipants[0].failures).to.equal(
      betParticipants.creator.isFeeForSuccess ? 1 : 0
    );
    expect(contestParticipants[0].variance).to.equal(
      betParticipants.creator.isFeeForSuccess ? -1 : 0
    );
    // Check second account
    expect(contestParticipants[1].accountAddress).to.equal(
      await accounts[betParticipants.second.accountIndex].getAddress()
    );
    expect(contestParticipants[1].successes).to.equal(
      betParticipants.second.isFeeForSuccess ? 0 : 1
    );
    expect(contestParticipants[1].failures).to.equal(
      betParticipants.second.isFeeForSuccess ? 1 : 0
    );
    expect(contestParticipants[1].variance).to.equal(
      betParticipants.second.isFeeForSuccess ? -1 : 1
    );
  });
});

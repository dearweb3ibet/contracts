import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Bet", function () {
  // Constants
  const feedSymbolEthUsd = "ETHUSD";
  const feedAddressEthUsd = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
  const betContractFee = 15;
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
  const betTotalFeeForSuccess = betParticipants.creator.fee.add(
    betParticipants.fourth.fee
  );
  const betTotalFeeForFailure = betParticipants.second.fee.add(
    betParticipants.third.fee
  );
  // Accounts
  let accounts: Array<Signer>;
  // Contracts
  let betCheckerContract: Contract;
  let betContract: Contract;
  // Helpful variables
  let lastTokenId = 0;

  before(async function () {
    // Init accounts
    accounts = await ethers.getSigners();
    // Init contracts
    betCheckerContract = await ethers
      .getContractFactory("BetCheckerFake")
      .then((factory) =>
        factory.deploy([feedSymbolEthUsd], [feedAddressEthUsd])
      );
    betContract = await ethers
      .getContractFactory("Bet")
      .then((factory) =>
        factory.deploy(betCheckerContract.address, betContractFee)
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
    ).to.changeEtherBalance(
      accounts[betParticipants.creator.accountIndex],
      betParticipants.creator.fee.mul(BigNumber.from(-1))
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
        participant.fee.mul(BigNumber.from(-1))
      );
    }
    // Check bet params
    const params = await betContract.getParams(lastTokenId);
    expect(params.totalFeeForSuccess).to.equal(betTotalFeeForSuccess);
    expect(params.totalFeeForFailure).to.equal(betTotalFeeForFailure);
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
    const account2Winning = betParticipants.second.fee
      .mul(betTotalFeeForSuccess)
      .div(betTotalFeeForFailure);
    const account3Winning = betParticipants.third.fee
      .mul(betTotalFeeForSuccess)
      .div(betTotalFeeForFailure);
    const contractBalance = betParticipants.creator.fee
      .add(betParticipants.second.fee)
      .add(betParticipants.third.fee)
      .add(betParticipants.fourth.fee);
    // Close bet and check balances
    await expect(betContract.connect(accounts[0]).close(lastTokenId))
      .to.changeEtherBalance(
        accounts[betParticipants.second.accountIndex],
        betParticipants.second.fee.add(account2Winning)
      )
      .to.changeEtherBalance(
        accounts[betParticipants.third.accountIndex],
        betParticipants.third.fee.add(account3Winning)
      )
      .and.to.changeEtherBalance(
        betContract.address,
        contractBalance.mul(BigNumber.from(-1))
      );
  });
});

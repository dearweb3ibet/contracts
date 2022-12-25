import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import {
  Bet,
  BetChecker,
  BetChecker__factory,
  Bet__factory,
  Bio,
  Bio__factory,
  Contest,
  Contest__factory,
  Hub,
  Hub__factory,
  MockBetChecker,
  MockBetChecker__factory,
  Usage,
  Usage__factory,
} from "../typechain-types";
import { revertToSnapshot, takeSnapshot } from "./helpers/utils";

export const betCheckerContractParams = {
  feedSymbolEthUsd: "ETHUSD",
  feedSymbolBtcUsd: "BTCUSD",
  feedAddressEthUsd: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
  feedAddressBtcUsdOne: "0x12162c3E810393dEC01362aBf156D7ecf6159528",
  feedAddressBtcUsdTwo: "0x007A22900a3B98143368Bd5906f8E17e9867581b",
};
export const betContractParams = {
  usageFeePercent: 10,
  contestFeePercent: 15,
};
export const contestWaveParams = {
  one: {
    endTimestamp: 1672099200,
    winnersNumber: 3,
  },
  two: {
    endTimestamp: 1676332800,
    winnersNumber: 2,
  },
};

export const betParams = {
  one: {
    uri: "ipfs://...",
    symbol: "ETHUSD",
    targetMinPrice: BigNumber.from(1000),
    targetMaxPrice: BigNumber.from(1200),
    targetTimestamp: BigNumber.from(1677672000),
    participationDeadlineTimestamp: BigNumber.from(1667088000),
  },
};

export const betParticipantFees = {
  eth003: BigNumber.from("30000000000000000"),
  eth005: BigNumber.from("50000000000000000"),
  eth01: BigNumber.from("100000000000000000"),
};

export const bioUris = {
  one: "ipfs://one",
  two: "ipfs://two",
};

export let accounts: Array<Signer>;
export let deployer: Signer;
export let userOne: Signer;
export let userTwo: Signer;
export let userThree: Signer;

export let deployerAddress: string;
export let userOneAddress: string;
export let userTwoAddress: string;
export let userThreeAddress: string;

export let hubContract: Hub;
export let contestContract: Contest;
export let usageContract: Usage;
export let betContract: Bet;
export let betCheckerContract: BetChecker;
export let mockBetCheckerContract: MockBetChecker;
export let bioContract: Bio;

export function makeSuiteCleanRoom(name: string, tests: () => void) {
  return describe(name, () => {
    beforeEach(async function () {
      await takeSnapshot();
    });
    tests();
    afterEach(async function () {
      await revertToSnapshot();
    });
  });
}

before(async function () {
  // Init accounts
  accounts = await ethers.getSigners();
  deployer = accounts[0];
  userOne = accounts[1];
  userTwo = accounts[2];
  userThree = accounts[3];

  // Init addresses
  deployerAddress = await deployer.getAddress();
  userOneAddress = await userOne.getAddress();
  userTwoAddress = await userTwo.getAddress();
  userThreeAddress = await userThree.getAddress();

  // Deploy hub contract
  hubContract = await new Hub__factory(deployer).deploy();
  await hubContract.initialize(
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    ethers.constants.AddressZero
  );
  // Deploy bet contract
  betContract = await new Bet__factory(deployer).deploy();
  await betContract.initialize(
    hubContract.address,
    betContractParams.contestFeePercent,
    betContractParams.usageFeePercent
  );
  // Deploy bet checker contract
  betCheckerContract = await new BetChecker__factory(deployer).deploy();
  betCheckerContract.initialize();
  // Deploy mock bet checker contract
  mockBetCheckerContract = await new MockBetChecker__factory(deployer).deploy();
  mockBetCheckerContract.setFeedAddresses(
    [betCheckerContractParams.feedSymbolEthUsd],
    [betCheckerContractParams.feedAddressEthUsd]
  );
  // Deploy contest contract
  contestContract = await new Contest__factory(deployer).deploy();
  await contestContract.initialize();
  // Deploy usage contract
  usageContract = await new Usage__factory(deployer).deploy();
  await usageContract.initialize();
  // Deploy bio contract
  bioContract = await new Bio__factory(deployer).deploy();
  await bioContract.initialize();

  // Set hub addresses
  await expect(
    hubContract.setBetAddress(betContract.address)
  ).to.be.not.reverted;
  await expect(
    hubContract.setBetCheckerAddress(mockBetCheckerContract.address)
  ).to.be.not.reverted;
  await expect(
    hubContract.setContestAddress(contestContract.address)
  ).to.be.not.reverted;
  await expect(
    hubContract.setUsageAddress(usageContract.address)
  ).to.be.not.reverted;
  await expect(
    hubContract.setBioAddress(bioContract.address)
  ).to.be.not.reverted;

  // Start contest wave
  await expect(
    contestContract.startWave(
      contestWaveParams.one.endTimestamp,
      contestWaveParams.one.winnersNumber
    )
  ).to.be.not.reverted;
});

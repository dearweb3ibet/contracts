import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import {
  Bet,
  Bet__factory,
  Contest,
  Contest__factory,
  Hub,
  Hub__factory,
  MockBetChecker,
  MockBetChecker__factory,
  Usage,
  Usage__factory,
} from "../typechain-types";

export const betCheckerContractParams = {
  feedSymbol: ["ETHUSD"],
  feedAddresses: ["0x0715A7794a1dc8e42615F059dD6e406A6594651A"],
};
export const betContractParams = {
  usageFeePercent: 10,
  contestFeePercent: 15,
};
export const contestWaveParams = {
  "1": {
    endTimestamp: 1672099200,
    winnersNumber: 3,
  },
};

export const betParams = {
  one: {
    uri: "ipfs://...",
    symbol: "ETHUSD",
    targetMinPrice: BigNumber.from(1000),
    targetMaxPrice: BigNumber.from(1200),
    targetTimestamp: BigNumber.from(1667088000),
    participationDeadlineTimestamp: BigNumber.from(1667088000),
  },
};

export const betParticipantFees = {
  eth003: BigNumber.from("30000000000000000"),
  eth005: BigNumber.from("50000000000000000"),
  eth01: BigNumber.from("100000000000000000"),
};

export let accounts: Array<Signer>;
export let deployer: Signer;
export let userOne: Signer;
export let userTwo: Signer;
export let userThree: Signer;

export let userOneAddress: string;
export let userTwoAddress: string;
export let userThreeAddress: string;

export let hubContract: Hub;
export let contestContract: Contest;
export let usageContract: Usage;
export let betContract: Bet;
export let mockBetCheckerContract: MockBetChecker;

before(async function () {
  // Init accounts
  accounts = await ethers.getSigners();
  deployer = accounts[0];
  userOne = accounts[1];
  userTwo = accounts[2];
  userThree = accounts[3];

  // Init addresses
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
  mockBetCheckerContract = await new MockBetChecker__factory(deployer).deploy();
  mockBetCheckerContract.setFeedAddresses(
    betCheckerContractParams.feedSymbol,
    betCheckerContractParams.feedAddresses
  );
  // Deploy contest contract
  contestContract = await new Contest__factory(deployer).deploy();
  await contestContract.initialize();
  // Deploy usage contract
  usageContract = await new Usage__factory(deployer).deploy();

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

  // Start contest wave
  await expect(
    contestContract.startWave(
      contestWaveParams["1"].endTimestamp,
      contestWaveParams["1"].winnersNumber
    )
  ).to.be.not.reverted;
});

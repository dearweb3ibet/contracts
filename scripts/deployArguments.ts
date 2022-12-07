import { contractArguments, deployedContracts } from "./constants";

const chain = "mumbai";
const chainDeployedContracts = deployedContracts[chain];
const chainContractArguments = contractArguments[chain];

// Bet checker contract
// module.exports = [
//   chainContractArguments.betChecker.feedSymbols,
//   chainContractArguments.betChecker.feedAddresses,
// ];

// Contest contract
// module.exports = [chainContractArguments.contest.winnersNumber];

// Usage contract
// module.exports = [];

// Bet contract
// module.exports = [
//   chainDeployedContracts.betChecker,
//   chainDeployedContracts.contest,
//   chainDeployedContracts.usage,
//   chainContractArguments.bet.contestFeePercent,
//   chainContractArguments.bet.usageFeePercent,
// ];

// Bio contract
// module.exports = [];

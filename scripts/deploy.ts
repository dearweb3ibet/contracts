import hre, { ethers } from "hardhat";
import {
  BetChecker__factory,
  Bet__factory,
  Bio__factory,
  Contest__factory,
  Hub__factory,
  Usage__factory,
} from "../typechain-types";
import { deployedContracts, deployedContractsData } from "./helpers/constants";
import {
  deployProxyWithLogs,
  deployWithLogs,
  upgradeProxyWithLogs,
} from "./helpers/utils";

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("\n❌ Chain is not defined");
    return;
  }
  console.log(`\n🌎 Running on chain '${chain}'`);

  // Define deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  // Define chain data
  const chainContracts = deployedContracts[chain];
  const chainContractsData = deployedContractsData[chain];

  // Deploy or upgrade hub contract
  if (chainContracts.hub.proxy === "") {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.hub.name,
      new Hub__factory(deployer),
      [
        chainContracts.bet.proxy || ethers.constants.AddressZero,
        chainContracts.betChecker.proxy || ethers.constants.AddressZero,
        chainContracts.contest.proxy || ethers.constants.AddressZero,
        chainContracts.usage.impl || ethers.constants.AddressZero,
        chainContracts.bio.proxy || ethers.constants.AddressZero,
      ]
    );
    chainContracts.hub.proxy = contract.address;
    // TODO: Send hub address to bet contract if it exists
  } else if (chainContracts.hub.impl === "") {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.hub.name,
      chainContracts.hub.proxy,
      new Hub__factory(deployer)
    );
  }

  // Stop script with error if hub is not deployed
  if (chainContracts.hub.proxy === "") {
    console.error(
      "\n❌ Failed deploy rest contracts because hub contract is not deployed"
    );
    return;
  }

  // Deploy or upgrade bet checker contract
  if (chainContracts.betChecker.proxy === "") {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.betChecker.name,
      new BetChecker__factory(deployer)
    );
    chainContracts.betChecker.proxy === contract.address;
    console.log("⚡ Set contract feed addresses");
    await contract.setFeedAddresses(
      chainContractsData.betChecker.feedSymbols,
      chainContractsData.betChecker.feedAddresses
    );
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployer
    ).setBetCheckerAddress(contract.address);
  } else if (chainContracts.betChecker.impl === "") {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.betChecker.name,
      chainContracts.betChecker.proxy,
      new BetChecker__factory(deployer)
    );
  }

  // Deploy or upgrade contest contract
  if (chainContracts.contest.proxy === "") {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.contest.name,
      new Contest__factory(deployer)
    );
    chainContracts.contest.proxy === contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployer
    ).setContestAddress(contract.address);
  } else if (chainContracts.contest.impl === "") {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.contest.name,
      chainContracts.contest.proxy,
      new Contest__factory(deployer)
    );
  }

  // Deploy usage contract
  if (chainContracts.usage.impl === "") {
    const contract = await deployWithLogs(
      chain,
      chainContracts.usage.impl,
      new Usage__factory(deployer)
    );
    chainContracts.usage.impl = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployer
    ).setUsageAddress(contract.address);
  }

  // Deploy or upgrade bet contract
  if (chainContracts.bet.proxy === "") {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.bet.name,
      new Bet__factory(deployer),
      [
        chainContracts.hub.proxy,
        chainContractsData.bet.contestFeePercent,
        chainContractsData.bet.usageFeePercent,
      ]
    );
    chainContracts.bet.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployer
    ).setBetAddress(contract.address);
  } else if (chainContracts.bet.impl === "") {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.bet.name,
      chainContracts.bet.proxy,
      new Bet__factory(deployer)
    );
  }

  // Deploy or upgrade bio contract
  if (chainContracts.bio.proxy === "") {
    const contract = await deployProxyWithLogs(
      chain,
      chainContracts.bio.name,
      new Bio__factory(deployer)
    );
    chainContracts.bio.proxy = contract.address;
    console.log("⚡ Send contract address to hub");
    await Hub__factory.connect(
      chainContracts.hub.proxy,
      deployer
    ).setBioAddress(contract.address);
  } else if (chainContracts.bio.impl === "") {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.bio.name,
      chainContracts.bio.proxy,
      new Bio__factory(deployer)
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

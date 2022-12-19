import hre, { ethers } from "hardhat";

const contracts: any = {
  mumbai: {
    betChecker: "0x3DbF54192Af966DF64Fb7c06a883Ac5d9f204429",
    contest: "0xB57C5F7BDc214A6A26aaf98FBccc87Fd19102620",
    usage: "0xc7e9b82765E5edf192D702e11B108cac6D51D186",
    bet: "0x9B8Bc148030026081F6548fc053358C9Ff4D75Ff",
    bio: "",
  },
};

const contractsData: any = {
  mumbai: {
    betChecker: {
      feedSymbols: ["ETHUSD"],
      feedAddresses: ["0x0715A7794a1dc8e42615F059dD6e406A6594651A"],
    },
    bet: {
      contestFeePercent: 15,
      usageFeePercent: 10,
    },
  },
};

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("\n❌ Chain is not defined");
    return;
  }
  console.log("\nRunning on chain: " + chain);

  // Define chain data
  const chainContracts = contracts[chain];
  const chainContractsData = contractsData[chain];

  // Deploy bet checker contract
  if (chainContracts.betChecker === "") {
    console.log("\n👟 Start deploy bet checker contract");
    const contract = await ethers
      .getContractFactory("BetChecker")
      .then((factory) => factory.deploy());
    await contract.setFeedAddresses(
      chainContractsData.betChecker.feedSymbols,
      chainContractsData.betChecker.feedAddresses
    );
    chainContracts.betChecker === contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }

  // Deploy contest contract
  if (chainContracts.contest === "") {
    console.log("\n👟 Start deploy contest contract");
    const contract = await ethers
      .getContractFactory("Contest")
      .then((factory) => factory.deploy());
    chainContracts.contest = contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }

  // Deploy usage contract
  if (chainContracts.usage === "") {
    console.log("\n👟 Start deploy usage contract");
    const contract = await ethers
      .getContractFactory("Usage")
      .then((factory) => factory.deploy());
    chainContracts.usage = contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }

  if (
    chainContracts.bet === "" &&
    chainContracts.betChecker !== "" &&
    chainContracts.contest !== "" &&
    chainContracts.usage !== ""
  ) {
    console.log("\n👟 Start deploy bet contract");
    const contract = await ethers
      .getContractFactory("Bet")
      .then((factory) =>
        factory.deploy(
          chainContracts.betChecker,
          chainContracts.contest,
          chainContracts.usage,
          chainContractsData.bet.contestFeePercent,
          chainContractsData.bet.usageFeePercent
        )
      );
    chainContracts.bet = contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address} ${chainContracts.betChecker} ${chainContracts.contest} ${chainContracts.usage} ${chainContractsData.bet.contestFeePercent} ${chainContractsData.bet.usageFeePercent}`
    );
  }

  if (chainContracts.bio === "") {
    console.log("\n👟 Start deploy bio contract");
    const contract = await ethers
      .getContractFactory("Bio")
      .then((factory) => factory.deploy());
    chainContracts.bio = contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

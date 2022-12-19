import hre, { upgrades, ethers } from "hardhat";
import {
  BetChecker__factory,
  Bet__factory,
  Bio__factory,
  Contest__factory,
  Usage__factory,
} from "../typechain-types";

const contracts: {
  [key: string]: {
    betChecker: string;
    contest: { proxy: string; proxyAdmin: string; impl: string };
    usage: string;
    bet: {
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
    bio: {
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
  };
} = {
  mumbai: {
    betChecker: "0x3DbF54192Af966DF64Fb7c06a883Ac5d9f204429",
    contest: {
      proxy: "0xe347c72CB77e5614E775908d3f43Ea27c8DBd293",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x13Ba0a259ee9e02E7a98a69c2941AD5208F6e0e5",
    },
    usage: "0xc7e9b82765E5edf192D702e11B108cac6D51D186",
    bet: {
      proxy: "0x6BecA207f047Ce5707cB4F0cb942DEFf95C2338D",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x1E1fF692418F7eE3A05CD4ca43bCce1d1E5b3F67",
    },
    bio: {
      proxy: "0x2c7388b7c05e399711A158739e894eBC264D396c",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xB23553dCe783f1918CD7C2fc6716Acdd6710763F",
    },
  },
};

const contractsData: {
  [key: string]: {
    betChecker: {
      feedSymbols: Array<string>;
      feedAddresses: Array<string>;
    };
    bet: {
      contestFeePercent: number;
      usageFeePercent: number;
    };
  };
} = {
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
  console.log(`\n🌎 Running on chain '${chain}'`);

  // Define deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  // Define chain data
  const chainContracts = contracts[chain];
  const chainContractsData = contractsData[chain];

  // Deploy bet checker contract
  if (chainContracts.betChecker === "") {
    console.log("\n👟 Start deploy bet checker contract");
    const contract = await new BetChecker__factory(deployer).deploy();
    await contract.setFeedAddresses(
      chainContractsData.betChecker.feedSymbols,
      chainContractsData.betChecker.feedAddresses
    );
    chainContracts.betChecker === contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "🥸 Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }

  // Deploy contest contract
  if (chainContracts.contest.proxy === "") {
    console.log("\n👟 Start deploy contest contract");
    const contract = await upgrades.deployProxy(new Contest__factory(deployer));
    await contract.deployed();
    chainContracts.contest.proxy = contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "🥸 Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }
  // Upgrade contest contract
  else if (chainContracts.contest.impl === "") {
    console.log("\n👟 Start upgrade contest contract");
    const contract = await upgrades.upgradeProxy(
      chainContracts.contest.proxy,
      new Contest__factory(deployer)
    );
    await contract.deployed();
    console.log("✅ Contract upgraded");
    console.log(
      "🥸 Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }

  // Deploy usage contract
  if (chainContracts.usage === "") {
    console.log("\n👟 Start deploy usage contract");
    const contract = await new Usage__factory(deployer).deploy();
    chainContracts.usage = contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "🥸 Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }

  // Deploy bet contract
  if (chainContracts.bet.proxy === "") {
    if (
      chainContracts.betChecker !== "" &&
      chainContracts.contest.proxy !== "" &&
      chainContracts.usage !== ""
    ) {
      console.log("\n👟 Start deploy bet contract");
      const contract = await upgrades.deployProxy(new Bet__factory(deployer), [
        chainContracts.betChecker,
        chainContracts.contest,
        chainContracts.usage,
        chainContractsData.bet.contestFeePercent,
        chainContractsData.bet.usageFeePercent,
      ]);
      await contract.deployed();
      chainContracts.bet.proxy = contract.address;
      console.log("✅ Contract deployed to " + contract.address);
      console.log(
        "🥸 Command for vefifying: " +
          `npx hardhat verify --network ${chain} ${contract.address}`
      );
    }
  }
  // Upgrade bet contract
  else if (chainContracts.bet.impl === "") {
    if (
      chainContracts.betChecker !== "" &&
      chainContracts.contest.proxy !== "" &&
      chainContracts.usage !== ""
    ) {
      console.log("\n👟 Start upgrade bet contract");
      const contract = await upgrades.upgradeProxy(
        chainContracts.bet.proxy,
        new Bet__factory(deployer)
      );
      await contract.deployed();
      console.log("✅ Contract upgraded");
      console.log(
        "🥸 Command for vefifying: " +
          `npx hardhat verify --network ${chain} ${contract.address}`
      );
    }
  }

  // Deploy bio contract
  if (chainContracts.bio.proxy === "") {
    console.log("\n👟 Start deploy bio contract");
    const contract = await upgrades.deployProxy(new Bio__factory(deployer));
    await contract.deployed();
    chainContracts.bio.proxy = contract.address;
    console.log("✅ Contract deployed to " + contract.address);
    console.log(
      "🥸 Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }
  // Upgrade bio contract
  else if (chainContracts.bio.impl === "") {
    console.log("\n👟 Start upgrade bio contract");
    const contract = await upgrades.upgradeProxy(
      chainContracts.bio.proxy,
      new Bio__factory(deployer)
    );
    await contract.deployed();
    console.log("✅ Contract upgraded");
    console.log(
      "🥸 Command for vefifying: " +
        `npx hardhat verify --network ${chain} ${contract.address}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

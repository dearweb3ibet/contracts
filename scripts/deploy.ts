import hre, { ethers } from "hardhat";

const deployedContracts: any = {
  mumbai: {
    betChecker: "0xE78Ec547bdE5697c1Dd2B32524c9a51F4385CC08",
    contest: "0xD09601e5a806c177483cA0F6deBf47f9D6B30cE7",
    bet: "0x8b89d0f890E3E848fcabe257695d1B5Bc64abCFA",
    bio: "0x752ab4DDf258eec8857a9115fAed1E3afE1Abbe5",
  },
};

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("Chain is not defined");
    return;
  }
  console.log("Running on chain: " + chain);

  // Define deployed contracts by chain
  const chainDeployedContracts = deployedContracts[chain];

  // Deploy bet checker contract
  if (chainDeployedContracts.betChecker === "") {
    console.log("Start deploy bet checker contract");
    const feedSymbols = ["ETHUSD"];
    const feedAddresses = ["0x0715A7794a1dc8e42615F059dD6e406A6594651A"];
    const contract = await ethers
      .getContractFactory("BetChecker")
      .then((factory) => factory.deploy(feedSymbols, feedAddresses));
    console.log("Bet checker contract deployed to " + contract.address);
  }

  // Deploy contest contract
  if (chainDeployedContracts.contest === "") {
    console.log("Start deploy contest contract");
    const winnersNumber = 3;
    const contract = await ethers
      .getContractFactory("Contest")
      .then((factory) => factory.deploy(winnersNumber));
    console.log("Contest contract deployed to " + contract.address);
  }

  if (
    chainDeployedContracts.bet === "" &&
    chainDeployedContracts.betChecker !== "" &&
    chainDeployedContracts.contest !== ""
  ) {
    console.log("Start deploy bet contract");
    const contestFeePercent = 15;
    const contract = await ethers
      .getContractFactory("Bet")
      .then((factory) =>
        factory.deploy(
          chainDeployedContracts.betChecker,
          chainDeployedContracts.contest,
          contestFeePercent
        )
      );
    console.log("Bet contract deployed to " + contract.address);
  }

  if (chainDeployedContracts.bio === "") {
    console.log("Start deploy bio contract");
    const contract = await ethers
      .getContractFactory("Bio")
      .then((factory) => factory.deploy());
    console.log("Bio contract deployed to " + contract.address);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

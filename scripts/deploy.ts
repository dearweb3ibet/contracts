import hre, { ethers } from "hardhat";

const deployedContracts: any = {
  mumbai: {
    degenFetcher: "0x7EAd5dC591f7a5Bfd90CA23CCB75f780281e8B55",
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

  // Deploy degen fetcher contract
  if (chainDeployedContracts.degenFetcher === "") {
    console.log("Start deploy degen fetcher contract");
    const contract = await ethers
      .getContractFactory("DegenFetcher")
      .then((factory) => factory.deploy());
    console.log("Degen fetcher contract deployed to " + contract.address);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

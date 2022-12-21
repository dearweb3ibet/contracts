import { Contract, ContractFactory } from "ethers";
import { upgrades } from "hardhat";

export async function deployWithLogs(
  chainName: string,
  contractName: string,
  contractFactory: ContractFactory,
  contractArgs?: Array<any>
): Promise<Contract> {
  console.log(`\n👟 Start deploy '${contractName}' contract`);
  const contract = await contractFactory.deploy(contractArgs);
  console.log("✅ Contract deployed to " + contract.address);
  console.log(
    "👉 Command for vefifying: " +
      `npx hardhat verify --network ${chainName} ${contract.address}`
  );
  return contract;
}

export async function deployProxyWithLogs(
  chainName: string,
  contractName: string,
  contractFactory: ContractFactory,
  contractArgs?: Array<any>
): Promise<Contract> {
  console.log(`\n👟 Start deploy '${contractName}' proxy contract`);
  const contract = await upgrades.deployProxy(contractFactory, contractArgs);
  await contract.deployed();
  console.log("✅ Contract deployed to " + contract.address);
  console.log(
    "👉 Command for vefifying: " +
      `npx hardhat verify --network ${chainName} ${contract.address}`
  );
  return contract;
}

export async function upgradeProxyWithLogs(
  chainName: string,
  contractName: string,
  contractAddress: string,
  contractFactory: ContractFactory
): Promise<Contract> {
  console.log(`\n👟 Start upgrade ${contractName} contract`);
  const contract = await upgrades.upgradeProxy(
    contractAddress,
    contractFactory
  );
  await contract.deployed();
  console.log("✅ Contract upgraded");
  console.log(
    "👉 Command for vefifying: " +
      `npx hardhat verify --network ${chainName} ${contract.address}`
  );
  return contract;
}

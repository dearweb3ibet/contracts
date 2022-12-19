import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    mumbai: {
      url: process.env.RPC_URL_MUMBAI || "",
      accounts:
        process.env.PRIVATE_KEY_MUMBAI_1 !== undefined &&
        process.env.PRIVATE_KEY_MUMBAI_2 !== undefined
          ? [process.env.PRIVATE_KEY_MUMBAI_1, process.env.PRIVATE_KEY_MUMBAI_2]
          : [],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.ETHERSCAN_API_KEY_MUMBAI || "",
    },
  },
};

export default config;

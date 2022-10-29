import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    mumbai: {
      url: process.env.RPC_URL_MUMBAI || "",
      accounts:
        process.env.PRIVATE_KEY_MUMBAI !== undefined
          ? [process.env.PRIVATE_KEY_MUMBAI]
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

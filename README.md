# dearweb3ibet contracts

## Commands

- Install dependencies - `npm install`
- Compile contracts and generate TypeChain - `npx hardhat compile`
- Run tests - `npx hardhat test`
- Deploy contracts - `npx hardhat run scripts/deploy.ts --network mumbai`
- Verify contract with arguments - `npx hardhat verify --network mumbai --constructor-args scripts/deployArguments.ts 0xE78Ec547bdE5697c1Dd2B32524c9a51F4385CC08`
- Run sandbox script - `npx hardhat run scripts/sandbox.ts --network mumbai`

## `.env` example

```
PRIVATE_KEY_MUMBAI=
RPC_URL_MUMBAI=
ETHERSCAN_API_KEY_MUMBAI=
```

## Links

- Chainlink historical price data docs - https://docs.chain.link/docs/data-feeds/price-feeds/historical-data/
- Chainlink price feed contract addresses - https://docs.chain.link/docs/data-feeds/price-feeds/addresses/
- Contract to easily get historical data from chainlink feeds - https://github.com/andyszy/DegenFetcher

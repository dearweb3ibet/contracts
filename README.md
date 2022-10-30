# dearweb3ibet contracts

## Commands

- Install dependencies - `npm install`
- Compile contracts and generate TypeChain - `npx hardhat compile`
- Run tests - `npx hardhat test`
- Deploy contracts - `npx hardhat run scripts/deploy.ts --network mumbai`
- Verify contract - `npx hardhat verify --network mumbai 0x7EAd5dC591f7a5Bfd90CA23CCB75f780281e8B55 "Argument 1" "Argument 2"`

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

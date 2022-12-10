import { ethers } from "hardhat";

async function main() {
  // Define accounts
  const accounts = await ethers.getSigners();

  // Define bet contract
  const betContractAddress = "0x9B8Bc148030026081F6548fc053358C9Ff4D75Ff";
  const betContractAbi: any = [
    {
      inputs: [
        {
          internalType: "address",
          name: "betCheckerAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "contestAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "usageAddress",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "contestFeePercent",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "usageFeePercent",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "approved",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "ApprovalForAll",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "creatorAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "creatorFee",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "symbol",
              type: "string",
            },
            {
              internalType: "int256",
              name: "targetMinPrice",
              type: "int256",
            },
            {
              internalType: "int256",
              name: "targetMaxPrice",
              type: "int256",
            },
            {
              internalType: "uint256",
              name: "targetTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "participationDeadlineTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForSuccess",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForFailure",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isClosed",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isSuccessful",
              type: "bool",
            },
          ],
          indexed: false,
          internalType: "struct Bet.Params",
          name: "params",
          type: "tuple",
        },
      ],
      name: "ParamsSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "addedTimestamp",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "accountAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "fee",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isFeeForSuccess",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "winning",
              type: "uint256",
            },
          ],
          indexed: false,
          internalType: "struct Bet.Participant",
          name: "participant",
          type: "tuple",
        },
      ],
      name: "ParticipantSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "tokenURI",
          type: "string",
        },
      ],
      name: "URISet",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "close",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "uri",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "fee",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "symbol",
          type: "string",
        },
        {
          internalType: "int256",
          name: "targetMinPrice",
          type: "int256",
        },
        {
          internalType: "int256",
          name: "targetMaxPrice",
          type: "int256",
        },
        {
          internalType: "uint256",
          name: "targetTimestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "participationDeadlineTimestamp",
          type: "uint256",
        },
      ],
      name: "create",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getApproved",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getBetCheckerAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "feedSymbol",
          type: "string",
        },
      ],
      name: "getBetCheckerFeedAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getContestAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getContestFeePercent",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getParams",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "createdTimestamp",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "creatorAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "creatorFee",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "symbol",
              type: "string",
            },
            {
              internalType: "int256",
              name: "targetMinPrice",
              type: "int256",
            },
            {
              internalType: "int256",
              name: "targetMaxPrice",
              type: "int256",
            },
            {
              internalType: "uint256",
              name: "targetTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "participationDeadlineTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForSuccess",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeForFailure",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isClosed",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isSuccessful",
              type: "bool",
            },
          ],
          internalType: "struct Bet.Params",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getParticipants",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "addedTimestamp",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "accountAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "fee",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isFeeForSuccess",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "winning",
              type: "uint256",
            },
          ],
          internalType: "struct Bet.Participant[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getUsageAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getUsageFeePercent",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
      ],
      name: "isApprovedForAll",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "setApprovalForAll",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "betCheckerAddress",
          type: "address",
        },
      ],
      name: "setBetCheckerAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "contestAddress",
          type: "address",
        },
      ],
      name: "setContestAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "contestFeePercent",
          type: "uint256",
        },
      ],
      name: "setContestFeePercent",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "usageAddress",
          type: "address",
        },
      ],
      name: "setUsageAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "usageFeePercent",
          type: "uint256",
        },
      ],
      name: "setUsageFeePercent",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4",
        },
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "fee",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isFeeForSuccess",
          type: "bool",
        },
      ],
      name: "takePart",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  const betContract = new ethers.Contract(betContractAddress, betContractAbi);

  // Define contest contract
  const contestContractAddress = "0xB57C5F7BDc214A6A26aaf98FBccc87Fd19102620";
  const contestContractAbi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Receiving",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "startTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "closeTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "winnersNumber",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "winning",
              type: "uint256",
            },
            {
              internalType: "address[]",
              name: "winners",
              type: "address[]",
            },
          ],
          indexed: false,
          internalType: "struct Contest.Wave",
          name: "wave",
          type: "tuple",
        },
      ],
      name: "WaveClose",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "startTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "closeTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "winnersNumber",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "winning",
              type: "uint256",
            },
            {
              internalType: "address[]",
              name: "winners",
              type: "address[]",
            },
          ],
          indexed: false,
          internalType: "struct Contest.Wave",
          name: "wave",
          type: "tuple",
        },
      ],
      name: "WaveCreate",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address[]",
          name: "winners",
          type: "address[]",
        },
      ],
      name: "closeLastWave",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getLastWave",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "startTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "closeTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "winnersNumber",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "winning",
              type: "uint256",
            },
            {
              internalType: "address[]",
              name: "winners",
              type: "address[]",
            },
          ],
          internalType: "struct Contest.Wave",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "getWave",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "startTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "closeTimestamp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "winnersNumber",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "winning",
              type: "uint256",
            },
            {
              internalType: "address[]",
              name: "winners",
              type: "address[]",
            },
          ],
          internalType: "struct Contest.Wave",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getWavesNumber",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "endTimestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "winnersNumber",
          type: "uint256",
        },
      ],
      name: "startWave",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ];
  const contestContract = new ethers.Contract(
    contestContractAddress,
    contestContractAbi
  );

  // Run some functions
  let transaction;
  // transaction = await betContract
  //   .connect(accounts[0])
  //   .create(
  //     "",
  //     ethers.utils.parseEther("0.01"),
  //     "ETHUSD",
  //     1200,
  //     1600,
  //     1672099200,
  //     1671580800,
  //     {
  //       value: ethers.utils.parseEther("0.01"),
  //     }
  //   );
  // transaction = await betContract
  //   .connect(accounts[1])
  //   .takePart(1, ethers.utils.parseEther("0.006"), false, {
  //     value: ethers.utils.parseEther("0.006"),
  //   });
  // transaction = await betContract.connect(accounts[0]).close(1);
  // transaction = await contestContract
  //   .connect(accounts[0])
  //   .startWave(1672099200, 2);
  // transaction = await contestContract
  //   .connect(accounts[0])
  //   .closeLastWave([
  //     accounts[0].address,
  //     accounts[0].address,
  //     accounts[0].address,
  //   ]);
  console.log("transaction:", transaction);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

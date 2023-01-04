export const deployedContracts: {
  [key: string]: {
    hub: {
      name: string;
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
    betChecker: {
      name: string;
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
    contest: { name: string; proxy: string; proxyAdmin: string; impl: string };
    usage: { name: string; proxy: string; proxyAdmin: string; impl: string };
    bet: {
      name: string;
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
    bio: {
      name: string;
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
  };
} = {
  mumbai: {
    hub: {
      name: "Hub",
      proxy: "0x9d34321F4Da9ebe2B8D282C62F6c33ed7cfC2d75",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xBE9eAB510159E7dddAb11cbD260347979887b60D",
    },
    betChecker: {
      name: "Bet Checker",
      proxy: "0xAb99ee3dE6716474C0f1309B9e760ca61b97EEB5",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x756Ee01a3453698a49C1297ACA5D4E086bEbA7f9",
    },
    contest: {
      name: "Contest",
      proxy: "0xA5DA20d741cDF8934f1C4A66388c36EE8B6Cc654",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x3Bc64e4bB8a60cD930ab88B5cf1aA20d6d3Bfb58",
    },
    usage: {
      name: "Usage",
      proxy: "0x74ba0a874b5d709177E953a07A018877582f2785",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xCFa0DDDcfe785336Db16C21f951a431F19310c97",
    },
    bet: {
      name: "Bet",
      proxy: "0xE2F5357435c7F4d9930eD69706EC1fE1A802AfA8",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xAe53db067b9359EEA2321dBCdfc18820e91572ce",
    },
    bio: {
      name: "Bio",
      proxy: "0xa11B8749dC4DAf12056F7d0628eE3d62Bc2d6814",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x96755a4c12ba2ac4ddeed472A86CF839D80fFbD5",
    },
  },
};

export const deployedContractsData: {
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
      feedSymbols: ["ETHUSD", "BTCUSD", "MATICUSD"],
      feedAddresses: [
        "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
        "0x007A22900a3B98143368Bd5906f8E17e9867581b",
        "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
      ],
    },
    bet: {
      contestFeePercent: 15,
      usageFeePercent: 10,
    },
  },
};

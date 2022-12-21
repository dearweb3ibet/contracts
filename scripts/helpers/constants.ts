export const deployedContracts: {
  [key: string]: {
    hub: {
      name: string;
      proxy: string;
      proxyAdmin: string;
      impl: string;
    };
    betChecker: { name: string; impl: string };
    contest: { name: string; proxy: string; proxyAdmin: string; impl: string };
    usage: { name: string; impl: string };
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
      proxy: "0x278Ff15163f010C6cd0839bcFd714cF5801Fe21D",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x2d6eCFCBD4A74095321643c9D13F65711e166976",
    },
    betChecker: {
      name: "Bet Checker",
      impl: "0x3DbF54192Af966DF64Fb7c06a883Ac5d9f204429",
    },
    contest: {
      name: "Contest",
      proxy: "0xd1fCB53E7A613670f81E1eB96e08C52550b95a24",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x914EE9EE1f413ac46f466fF6F6aB8b6E041dc556",
    },
    usage: {
      name: "Usage",
      impl: "0xc7e9b82765E5edf192D702e11B108cac6D51D186",
    },
    bet: {
      name: "Bet",
      proxy: "0xB5449BBE1522DE348fa4519d233f6f37aaA6F7C2",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xE31ba2Df84A660A415e1a746bA14Ec92d27496ac",
    },
    bio: {
      name: "Bio",
      proxy: "0x2c7388b7c05e399711A158739e894eBC264D396c",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xB23553dCe783f1918CD7C2fc6716Acdd6710763F",
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
      feedSymbols: ["ETHUSD"],
      feedAddresses: ["0x0715A7794a1dc8e42615F059dD6e406A6594651A"],
    },
    bet: {
      contestFeePercent: 15,
      usageFeePercent: 10,
    },
  },
};

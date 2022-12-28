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
      proxy: "0xdad42A57298D81923F99faFFFfc7038136b50401",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x841A77959cf920F416d7b28B8Dcc269624B4CacA",
    },
    betChecker: {
      name: "Bet Checker",
      proxy: "0x1CB532A5fb936AF408a21eC94607552A0d0cAa57",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x6b5c040F1507a81BDE773A64Bb73066f2F26f9c1",
    },
    contest: {
      name: "Contest",
      proxy: "0x13694254456625C41FF65C35925747a52326fe10",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x85D4a16F2035256211fAD0df63Cf511b8FE9EC48",
    },
    usage: {
      name: "Usage",
      proxy: "0x70012aC52162EF285aaBDE967b97e29688316c09",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x78e3CE4FF2EcBa1eE645d222F6C5473E683eB31a",
    },
    bet: {
      name: "Bet",
      proxy: "0x39113c1E8795417028F870B6496A0dD8faCCa2C3",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xC42B7B25CF0c2D1d2A33C9A0075D7529f6D0ac3a",
    },
    bio: {
      name: "Bio",
      proxy: "0x43cf12A32F2e08625eeE69E6E90a8f1052800f7d",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xA4FE6A2C332c21F5921F70cFb4cBD657749B8508",
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

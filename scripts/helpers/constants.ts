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
      proxy: "0x820CE6E906c9d53A05dbc847B17e1231EECcfa80",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xB6bd00ae1C0363C46C4A4F04fbE57d0F5cB58099",
    },
    usage: {
      name: "Usage",
      proxy: "0x8b63FedD83BaaA0Dc622b966d44D1Bf071304fD5",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0x78e3CE4FF2EcBa1eE645d222F6C5473E683eB31a",
    },
    bet: {
      name: "Bet",
      proxy: "0x0b4C5Cde52EAC43879a4dBc16C5d3648d96207F4",
      proxyAdmin: "0x0d3b20f33e95Cf06f05b9ffD0b34faEED67baCd5",
      impl: "0xea7Cf4D7297620F827CFF65E9473343585a87087",
    },
    bio: {
      name: "Bio",
      proxy: "0xe38c49e759aB5Aa302e0843D42D43c14f8812de4",
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

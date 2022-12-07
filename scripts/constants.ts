export const deployedContracts: any = {
  mumbai: {
    betChecker: "0xE78Ec547bdE5697c1Dd2B32524c9a51F4385CC08",
    contest: "0xD09601e5a806c177483cA0F6deBf47f9D6B30cE7",
    usage: "0xD67c41DE6FE17e13060A7c7534aFCD4CD5c4afcB",
    bet: "0x9E5fA82C9a529c1d7Bd59D3D7AfF597D2948f744",
    bio: "0x752ab4DDf258eec8857a9115fAed1E3afE1Abbe5",
  },
};

export const contractArguments: any = {
  mumbai: {
    betChecker: {
      feedSymbols: ["ETHUSD"],
      feedAddresses: ["0x0715A7794a1dc8e42615F059dD6e406A6594651A"],
    },
    contest: {
      winnersNumber: 3,
    },
    bet: {
      contestFeePercent: 15,
      usageFeePercent: 10,
    },
  },
};

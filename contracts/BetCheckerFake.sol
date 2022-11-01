// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./interfaces/BetCheckerInterface.sol";

contract BetCheckerFake is BetCheckerInterface {
    mapping(string => address) internal _feedAddresses;

    constructor(string[] memory feedSymbols, address[] memory feedAddresses) {
        require(
            feedSymbols.length == feedAddresses.length,
            "lenghs of input arrays must be the same"
        );
        for (uint i = 0; i < feedSymbols.length; i++) {
            _feedAddresses[feedSymbols[i]] = feedAddresses[i];
        }
    }

    function isPriceExist(
        string memory symbol,
        uint dayStartTimestamp,
        int minPrice,
        int maxPrice
    )
        external
        view
        returns (
            bool,
            int,
            int
        )
    {
        return (false, 0, 0);
    }

    function getFeedAddress(string memory feedSymbol)
        external
        view
        returns (address)
    {
        return _feedAddresses[feedSymbol];
    }
}

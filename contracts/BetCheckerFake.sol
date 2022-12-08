// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/BetCheckerInterface.sol";

contract BetCheckerFake is BetCheckerInterface, Ownable {
    mapping(string => address) internal _feedAddresses;

    function setFeedAddresses(
        string[] memory feedSymbols,
        address[] memory feedAddresses
    ) public onlyOwner {
        require(
            feedSymbols.length == feedAddresses.length,
            "lenghs of input arrays must be the same"
        );
        for (uint i = 0; i < feedSymbols.length; i++) {
            _feedAddresses[feedSymbols[i]] = feedAddresses[i];
        }
    }

    function setFeedAddress(
        string memory feedSymbol,
        address feedAddress
    ) public onlyOwner {
        _feedAddresses[feedSymbol] = feedAddress;
    }

    function getFeedAddress(
        string memory feedSymbol
    ) external view returns (address) {
        return _feedAddresses[feedSymbol];
    }

    /**
     * Return always a negative checking result.
     */
    function isPriceExist(
        string memory symbol,
        uint dayStartTimestamp,
        int minPrice,
        int maxPrice
    ) external view returns (bool, int, int) {
        return (false, 0, 0);
    }
}

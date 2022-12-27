// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IBetChecker.sol";
import "../libraries/Errors.sol";

/**
 * Mock contract that return always a negative checking result.
 */
contract MockBetChecker is IBetChecker, Ownable {
    mapping(string => address) private _feedAddresses;

    function setFeedAddresses(
        string[] memory feedSymbols,
        address[] memory feedAddresses
    ) public onlyOwner {
        require(
            feedSymbols.length == feedAddresses.length,
            Errors.LENGTH_OF_INPUT_ARRAYS_MUST_BE_THE_SAME
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
        string memory,
        uint,
        int,
        int
    ) external pure returns (bool, int, int) {
        return (false, 0, 0);
    }
}

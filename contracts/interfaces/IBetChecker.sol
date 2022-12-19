// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IBetChecker {
    function setFeedAddresses(
        string[] memory feedSymbols,
        address[] memory feedAddresses
    ) external;

    function setFeedAddress(
        string memory feedSymbol,
        address feedAddress
    ) external;

    function getFeedAddress(
        string memory feedSymbol
    ) external view returns (address);

    function isPriceExist(
        string memory symbol,
        uint dayStartTimestamp,
        int minPrice,
        int maxPrice
    ) external view returns (bool, int, int);
}

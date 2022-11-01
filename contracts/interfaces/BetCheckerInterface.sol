// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface BetCheckerInterface {
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
        );

    function getFeedAddress(string memory feedSymbol)
        external
        view
        returns (address);
}

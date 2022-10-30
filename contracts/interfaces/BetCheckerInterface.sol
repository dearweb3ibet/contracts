// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface BetCheckerInterface {
    function isPriceExist(
        address feedAddress,
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

    function getTestString() external pure returns (string memory);
}

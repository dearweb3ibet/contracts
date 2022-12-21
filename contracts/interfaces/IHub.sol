// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IHub {
    function getBetAddress() external view returns (address);

    function getBetCheckerAddress() external view returns (address);

    function getContestAddress() external view returns (address);

    function getUsageAddress() external view returns (address);

    function getBioAddress() external view returns (address);
}

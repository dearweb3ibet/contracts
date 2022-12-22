// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IHub.sol";

/**
 * Contract to store addresses of other contracts.
 */
contract Hub is IHub, OwnableUpgradeable {
    address private _betAddress;
    address private _betCheckerAddress;
    address private _contestAddress;
    address private _usageAddress;
    address private _bioAddress;

    function initialize(
        address betAddress,
        address betCheckerAddress,
        address contestAddress,
        address usageAddress,
        address bioAddress
    ) public initializer {
        __Ownable_init();
        _betAddress = betAddress;
        _betCheckerAddress = betCheckerAddress;
        _contestAddress = contestAddress;
        _usageAddress = usageAddress;
        _bioAddress = bioAddress;
    }

    function getBetAddress() public view returns (address) {
        return _betAddress;
    }

    function setBetAddress(address betAddress) public onlyOwner {
        _betAddress = betAddress;
    }

    function getBetCheckerAddress() public view returns (address) {
        return _betCheckerAddress;
    }

    function setBetCheckerAddress(address betCheckerAddress) public onlyOwner {
        _betCheckerAddress = betCheckerAddress;
    }

    function getContestAddress() public view returns (address) {
        return _contestAddress;
    }

    function setContestAddress(address contestAddress) public onlyOwner {
        _contestAddress = contestAddress;
    }

    function getUsageAddress() public view returns (address) {
        return _usageAddress;
    }

    function setUsageAddress(address usageAddress) public onlyOwner {
        _usageAddress = usageAddress;
    }

    function getBioAddress() public view returns (address) {
        return _bioAddress;
    }

    function setBioAddress(address bioAddress) public onlyOwner {
        _bioAddress = bioAddress;
    }
}

// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./libraries/Events.sol";

/**
 * Contract to receive usage fee from the bet contract.
 */
contract Usage is OwnableUpgradeable {
    function initialize() public initializer {
        __Ownable_init();
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    receive() external payable {
        emit Events.Received(msg.sender, msg.value);
    }
}

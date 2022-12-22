// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./libraries/Events.sol";

/**
 * Contract to receive usage fee from the bet contract.
 *
 * TODO: Make contract upgradeable and add initializer
 */
contract Usage is Ownable {
    receive() external payable {
        emit Events.Received(msg.sender, msg.value);
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}

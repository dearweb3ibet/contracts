// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

// TODO: Add functions to get and set winners number
contract Contest is Ownable {
    event Received(address, uint);

    uint _winnersNumber;

    constructor(uint winnersNumber) {
        _winnersNumber = winnersNumber;
    }

    function sendWinnings(address[] memory winners) public onlyOwner {
        // Checks
        require(address(this).balance > 0, "contract balance is zero");
        require(
            winners.length == _winnersNumber,
            "length of winners array is incorrect"
        );
        // Send winnings
        uint winningValue = address(this).balance / _winnersNumber;
        for (uint i = 0; i < winners.length; i++) {
            (bool sent, ) = winners[i].call{value: winningValue}("");
            require(sent, "failed to send fee and winning");
        }
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}

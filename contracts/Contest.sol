// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Contest is Ownable {
    event Receiving(address sender, uint value);
    event WaveCreate(uint index, Wave wave);
    event WaveClose(uint index, Wave wave);

    struct Wave {
        uint startTimestamp;
        uint endTimestamp;
        uint closeTimestamp;
        uint winnersNumber;
        uint winning;
        address[] winners;
    }

    uint private _wavesNumber;
    mapping(uint256 => Wave) private _waves;

    function startWave(uint endTimestamp, uint winnersNumber) public onlyOwner {
        // Checks
        require(
            _wavesNumber == 0 ||
                (_wavesNumber != 0 &&
                    _waves[_wavesNumber - 1].closeTimestamp != 0),
            "last wave is not closed"
        );
        // Create wave
        Wave storage wave = _waves[_wavesNumber++];
        wave.startTimestamp = block.timestamp;
        wave.endTimestamp = endTimestamp;
        wave.winnersNumber = winnersNumber;
        emit WaveCreate(_wavesNumber - 1, wave);
    }

    // TODO: Check that end date allows to close last wave
    function closeLastWave(address[] memory winners) public onlyOwner {
        // Checks
        require(_wavesNumber > 0, "waves list is empty");
        require(
            _waves[_wavesNumber - 1].closeTimestamp == 0,
            "last wave is already closed"
        );
        require(
            winners.length == _waves[_wavesNumber - 1].winnersNumber,
            "number of winners is incorrect"
        );
        // Close wave
        Wave storage wave = _waves[_wavesNumber - 1];
        wave.closeTimestamp = block.timestamp;
        wave.winning = address(this).balance;
        wave.winners = winners;
        emit WaveClose(_wavesNumber - 1, wave);
        // Send winnings
        uint winningValue = address(this).balance / wave.winnersNumber;
        for (uint i = 0; i < winners.length; i++) {
            (bool sent, ) = winners[i].call{value: winningValue}("");
            require(sent, "failed to send winning");
        }
    }

    function getWavesNumber() public view returns (uint) {
        return _wavesNumber;
    }

    function getWave(uint index) public view returns (Wave memory) {
        return _waves[index];
    }

    function getLastWave() public view returns (Wave memory) {
        return _waves[_wavesNumber - 1];
    }

    receive() external payable {
        emit Receiving(msg.sender, msg.value);
    }
}

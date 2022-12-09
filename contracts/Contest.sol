// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ContestInterface.sol";

contract Contest is ContestInterface, Ownable {
    struct Wave {
        uint startTimestamp;
        uint endTimestamp;
        uint closeTimestamp;
        uint winnersNumber;
        uint winning;
        address[] winners;
    }

    struct WaveParticipant {
        address accountAddress;
        int successes;
        int failures;
        int variance;
    }

    event Receiving(address sender, uint value);
    event WaveCreate(uint index, Wave wave);
    event WaveClose(uint index, Wave wave);
    event WaveParticipantSet(
        uint index,
        address indexed participantAccountAddress,
        WaveParticipant participant
    );

    uint private _wavesNumber;
    mapping(uint256 => Wave) private _waves;
    mapping(uint256 => WaveParticipant[]) private _waveParticipants;

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

    function getWaveParticipants(
        uint index
    ) public view returns (WaveParticipant[] memory) {
        return _waveParticipants[index];
    }

    function getLastWaveParticipants()
        public
        view
        returns (WaveParticipant[] memory)
    {
        return _waveParticipants[_wavesNumber - 1];
    }

    // TODO: Check that data sended by bet contract
    function processBetParticipants(
        address[] memory betParticipantAddresses,
        uint[] memory betParticipantWinnings
    ) public {
        // Check waves number
        if (_wavesNumber == 0) {
            return;
        }
        // Get and check last wave
        Wave storage wave = _waves[_wavesNumber - 1];
        if (wave.startTimestamp == 0 || wave.closeTimestamp != 0) {
            return;
        }
        // Get last wave participants
        WaveParticipant[] storage waveParticipants = _waveParticipants[
            _wavesNumber - 1
        ];
        // Pricess every bet participant
        for (uint i = 0; i < betParticipantAddresses.length; i++) {
            // Try find wave participant by bet participant
            bool isWaveParticipantFound = false;
            for (uint j = 0; j < waveParticipants.length; j++) {
                if (
                    waveParticipants[j].accountAddress ==
                    betParticipantAddresses[i]
                ) {
                    isWaveParticipantFound = true;
                    // Update wave participant if found
                    if (betParticipantWinnings[i] > 0) {
                        waveParticipants[j].successes++;
                    } else {
                        waveParticipants[j].failures++;
                    }
                    waveParticipants[j].variance =
                        waveParticipants[j].successes -
                        waveParticipants[j].failures;
                    // Emit event
                    emit WaveParticipantSet(
                        _wavesNumber - 1,
                        waveParticipants[j].accountAddress,
                        waveParticipants[j]
                    );
                }
            }
            // Create wave participant if not found by bet participant
            if (!isWaveParticipantFound) {
                // Create wave
                WaveParticipant memory waveParticipant = WaveParticipant(
                    betParticipantAddresses[i],
                    betParticipantWinnings[i] > 0 ? int(1) : int(0),
                    betParticipantWinnings[i] > 0 ? int(0) : int(1),
                    betParticipantWinnings[i] > 0 ? int(1) : int(-1)
                );
                waveParticipants.push(waveParticipant);
                // Emit event
                emit WaveParticipantSet(
                    _wavesNumber - 1,
                    waveParticipant.accountAddress,
                    waveParticipant
                );
            }
        }
    }

    receive() external payable {
        emit Receiving(msg.sender, msg.value);
    }
}

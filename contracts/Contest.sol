// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IContest.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Events.sol";

contract Contest is IContest, Ownable {
    uint private _wavesNumber;
    mapping(uint256 => DataTypes.ContestWave) private _waves;
    mapping(uint256 => DataTypes.ContestWaveParticipant[])
        private _waveParticipants;

    function startWave(uint endTimestamp, uint winnersNumber) public onlyOwner {
        // Checks
        require(
            _wavesNumber == 0 ||
                (_wavesNumber != 0 &&
                    _waves[_wavesNumber - 1].closeTimestamp != 0),
            "last wave is not closed"
        );
        // Create wave
        DataTypes.ContestWave storage wave = _waves[_wavesNumber++];
        wave.startTimestamp = block.timestamp;
        wave.endTimestamp = endTimestamp;
        wave.winnersNumber = winnersNumber;
        emit Events.ContestWaveCreated(_wavesNumber - 1, wave);
    }

    // TODO: Check that end date allows to close wave
    function closeWave(uint index, address[] memory winners) public onlyOwner {
        // Checks
        require(_waves[index].startTimestamp != 0, "wave is not started");
        require(_waves[index].closeTimestamp == 0, "wave is already closed");
        require(
            winners.length == _waves[index].winnersNumber,
            "number of winners is incorrect"
        );
        // Close wave
        DataTypes.ContestWave storage wave = _waves[index];
        wave.closeTimestamp = block.timestamp;
        wave.winning = address(this).balance;
        wave.winners = winners;
        emit Events.ContestWaveClosed(index, wave);
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

    function getLastWaveIndex() public view returns (uint) {
        return _wavesNumber - 1;
    }

    function getWave(
        uint index
    ) public view returns (DataTypes.ContestWave memory) {
        return _waves[index];
    }

    function getWaveParticipants(
        uint index
    ) public view returns (DataTypes.ContestWaveParticipant[] memory) {
        return _waveParticipants[index];
    }

    /**
     * Update last wave participant by bet participants data.
     *
     * TODO: Check that data sended by bet contract
     */
    function processBetParticipants(
        address[] memory betParticipantAddresses,
        uint[] memory betParticipantWinnings
    ) public {
        // Get last wave
        uint lastWaveIndex = getLastWaveIndex();
        DataTypes.ContestWave storage wave = _waves[lastWaveIndex];
        // Check last wave
        if (wave.startTimestamp == 0 || wave.closeTimestamp != 0) {
            return;
        }
        // Get last wave participants
        DataTypes.ContestWaveParticipant[]
            storage waveParticipants = _waveParticipants[lastWaveIndex];
        // Process every bet participant
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
                    emit Events.ContestWaveParticipantSet(
                        lastWaveIndex,
                        waveParticipants[j].accountAddress,
                        waveParticipants[j]
                    );
                }
            }
            // Create wave participant if not found by bet participant
            if (!isWaveParticipantFound) {
                // Create wave
                DataTypes.ContestWaveParticipant
                    memory waveParticipant = DataTypes.ContestWaveParticipant(
                        betParticipantAddresses[i],
                        betParticipantWinnings[i] > 0 ? int(1) : int(0),
                        betParticipantWinnings[i] > 0 ? int(0) : int(1),
                        betParticipantWinnings[i] > 0 ? int(1) : int(-1)
                    );
                waveParticipants.push(waveParticipant);
                // Emit event
                emit Events.ContestWaveParticipantSet(
                    lastWaveIndex,
                    waveParticipant.accountAddress,
                    waveParticipant
                );
            }
        }
    }

    receive() external payable {
        emit Events.Received(msg.sender, msg.value);
    }
}

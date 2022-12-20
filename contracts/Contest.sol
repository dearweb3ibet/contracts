// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IContest.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Events.sol";

contract Contest is IContest, OwnableUpgradeable {
    using Counters for Counters.Counter;

    Counters.Counter private _counter;
    mapping(uint256 => DataTypes.ContestWave) private _waves;
    mapping(uint256 => DataTypes.ContestWaveParticipant[])
        private _waveParticipants;

    function initialize() public initializer {
        __Ownable_init();
    }

    function startWave(uint endTimestamp, uint winnersNumber) public onlyOwner {
        // Checks
        require(
            _counter.current() == 0 ||
                (_counter.current() != 0 &&
                    _waves[_counter.current()].closeTimestamp != 0),
            "last wave is not closed"
        );
        // Update counter
        _counter.increment();
        // Create wave
        DataTypes.ContestWave storage wave = _waves[_counter.current()];
        wave.startTimestamp = block.timestamp;
        wave.endTimestamp = endTimestamp;
        wave.winnersNumber = winnersNumber;
        emit Events.ContestWaveCreated(_counter.current(), wave);
    }

    // TODO: Check that end date allows to close wave
    function closeWave(uint id, address[] memory winners) public onlyOwner {
        // Checks
        require(_waves[id].startTimestamp != 0, "wave is not started");
        require(_waves[id].closeTimestamp == 0, "wave is already closed");
        require(
            winners.length == _waves[id].winnersNumber,
            "number of winners is incorrect"
        );
        // Close wave
        DataTypes.ContestWave storage wave = _waves[id];
        wave.closeTimestamp = block.timestamp;
        wave.winning = address(this).balance;
        wave.winners = winners;
        emit Events.ContestWaveClosed(id, wave);
        // Send winnings
        uint winningValue = address(this).balance / wave.winnersNumber;
        for (uint i = 0; i < winners.length; i++) {
            (bool sent, ) = winners[i].call{value: winningValue}("");
            require(sent, "failed to send winning");
        }
    }

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    function getWave(
        uint id
    ) public view returns (DataTypes.ContestWave memory) {
        return _waves[id];
    }

    function getWaveParticipants(
        uint id
    ) public view returns (DataTypes.ContestWaveParticipant[] memory) {
        return _waveParticipants[id];
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
        // Get and check last wave
        DataTypes.ContestWave storage wave = _waves[_counter.current()];
        if (wave.startTimestamp == 0 || wave.closeTimestamp != 0) {
            return;
        }
        // Get last wave participants
        DataTypes.ContestWaveParticipant[]
            storage waveParticipants = _waveParticipants[_counter.current()];
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
                        _counter.current(),
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
                    _counter.current(),
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

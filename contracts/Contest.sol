// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IContest.sol";
import "./interfaces/IHub.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Errors.sol";

/**
 * Contract to recieve funds from the bet contract and send it to winners.
 */
contract Contest is IContest, OwnableUpgradeable {
    using Counters for Counters.Counter;

    event WaveCreated(uint id, DataTypes.ContestWave wave);
    event WaveClosed(uint id, DataTypes.ContestWave wave);
    event WaveParticipantSet(
        uint id,
        address indexed participantAccountAddress,
        DataTypes.ContestWaveParticipant participant
    );
    event Received(address sender, uint value);

    address private _hubAddress;
    Counters.Counter private _counter;
    mapping(uint256 => DataTypes.ContestWave) private _waves;
    mapping(uint256 => DataTypes.ContestWaveParticipant[])
        private _waveParticipants;

    function initialize(address hubAddress) public initializer {
        __Ownable_init();
        _hubAddress = hubAddress;
    }

    function getHubAddress() public view returns (address) {
        return _hubAddress;
    }

    function setHubAddress(address hubAddress) public onlyOwner {
        _hubAddress = hubAddress;
    }

    function startWave(uint endTimestamp, uint winnersNumber) public onlyOwner {
        // Checks
        require(
            _counter.current() == 0 ||
                (_counter.current() != 0 &&
                    _waves[_counter.current()].closeTimestamp != 0),
            Errors.LAST_WAVE_IS_NOT_CLOSED
        );
        // Update counter
        _counter.increment();
        // Create wave
        DataTypes.ContestWave storage wave = _waves[_counter.current()];
        wave.startTimestamp = block.timestamp;
        wave.endTimestamp = endTimestamp;
        wave.winnersNumber = winnersNumber;
        emit WaveCreated(_counter.current(), wave);
    }

    function closeWave(uint id, address[] memory winners) public onlyOwner {
        // Checks
        require(_waves[id].startTimestamp != 0, Errors.WAVE_IS_NOT_STARTED);
        require(_waves[id].closeTimestamp == 0, Errors.WAVE_IS_ALREADY_CLOSED);
        require(
            _waves[id].endTimestamp < block.timestamp,
            Errors.WAVE_END_TIMESTAMP_HAS_NOT_COME
        );
        require(
            winners.length == _waves[id].winnersNumber,
            Errors.NUMBER_OF_WINNERS_IS_INCORRECT
        );
        // Close wave
        DataTypes.ContestWave storage wave = _waves[id];
        wave.closeTimestamp = block.timestamp;
        wave.winning = address(this).balance;
        wave.winners = winners;
        emit WaveClosed(id, wave);
        // Send winnings
        uint winningValue = address(this).balance / wave.winnersNumber;
        for (uint i = 0; i < winners.length; i++) {
            (bool sent, ) = winners[i].call{value: winningValue}("");
            require(sent, Errors.FAILED_TO_SEND_WINNING);
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
     * Update last wave participant by data about closed bet participants.
     */
    function processClosedBetParticipants(
        DataTypes.BetParticipant[] memory betParticipants
    ) public {
        // Checks
        require(
            msg.sender == IHub(_hubAddress).getBetAddress(),
            Errors.ONLY_BET_CONTRACT_CAN_BE_SENDER
        );
        // Get and check last wave
        DataTypes.ContestWave storage wave = _waves[_counter.current()];
        if (
            wave.startTimestamp == 0 ||
            wave.endTimestamp < block.timestamp ||
            wave.closeTimestamp != 0
        ) {
            return;
        }
        // Get last wave participants
        DataTypes.ContestWaveParticipant[]
            storage waveParticipants = _waveParticipants[_counter.current()];
        // Process every bet participant
        for (uint i = 0; i < betParticipants.length; i++) {
            // Try find wave participant by bet participant
            bool isWaveParticipantFound = false;
            for (uint j = 0; j < waveParticipants.length; j++) {
                if (
                    waveParticipants[j].accountAddress ==
                    betParticipants[i].accountAddress
                ) {
                    isWaveParticipantFound = true;
                    // Update wave participant if found
                    if (betParticipants[i].isWinner) {
                        waveParticipants[j].successes++;
                    } else {
                        waveParticipants[j].failures++;
                    }
                    waveParticipants[j].variance =
                        waveParticipants[j].successes -
                        waveParticipants[j].failures;
                    // Emit event
                    emit WaveParticipantSet(
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
                        betParticipants[i].accountAddress,
                        betParticipants[i].isWinner ? int(1) : int(0),
                        !betParticipants[i].isWinner ? int(1) : int(0),
                        betParticipants[i].isWinner ? int(1) : int(-1)
                    );
                waveParticipants.push(waveParticipant);
                // Emit event
                emit WaveParticipantSet(
                    _counter.current(),
                    waveParticipant.accountAddress,
                    waveParticipant
                );
            }
        }
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}

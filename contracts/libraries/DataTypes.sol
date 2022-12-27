// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library DataTypes {
    struct BetParams {
        uint createdTimestamp;
        address creatorAddress;
        uint creatorFee;
        string symbol;
        int targetMinPrice;
        int targetMaxPrice;
        uint targetTimestamp;
        uint participationDeadlineTimestamp;
        uint feeForSuccess;
        uint feeForFailure;
        bool isClosed;
        bool isSuccessful;
    }

    struct BetParticipant {
        uint addedTimestamp;
        address accountAddress;
        uint fee;
        bool isFeeForSuccess;
        bool isWinner;
        uint winning;
    }

    struct ContestWave {
        uint startTimestamp;
        uint endTimestamp;
        uint closeTimestamp;
        uint winnersNumber;
        uint winning;
        address[] winners;
    }

    struct ContestWaveParticipant {
        address accountAddress;
        int successes;
        int failures;
        int variance;
    }
}

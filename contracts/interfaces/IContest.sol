// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "../libraries/DataTypes.sol";

interface IContest {
    function processClosedBetParticipants(
        DataTypes.BetParticipant[] memory betParticipants
    ) external;
}

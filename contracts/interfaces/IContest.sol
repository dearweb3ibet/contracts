// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IContest {
    function processBetParticipants(
        address[] memory betParticipantAddresses,
        uint[] memory betParticipantWinnings
    ) external;
}

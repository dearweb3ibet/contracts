// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "../libraries/DataTypes.sol";

library Events {
    // Common
    event Received(address sender, uint value);
    event URISet(uint256 indexed tokenId, string tokenURI);

    // Bet
    event BetParamsSet(uint256 indexed tokenId, DataTypes.BetParams params);
    event BetParticipantSet(
        uint256 indexed tokenId,
        address indexed participantAccountAddress,
        DataTypes.BetParticipant participant
    );

    // Contest
    event ContestWaveCreated(uint index, DataTypes.ContestWave wave);
    event ContestWaveClosed(uint index, DataTypes.ContestWave wave);
    event ContestWaveParticipantSet(
        uint index,
        address indexed participantAccountAddress,
        DataTypes.ContestWaveParticipant participant
    );
}

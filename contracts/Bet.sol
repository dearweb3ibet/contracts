// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBetChecker.sol";
import "./interfaces/IContest.sol";
import "./libraries/DataTypes.sol";

contract Bet is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    event URISet(uint256 indexed tokenId, string tokenURI);
    event ParamsSet(uint256 indexed tokenId, DataTypes.BetParams params);
    event ParticipantSet(
        uint256 indexed tokenId,
        address indexed participantAccountAddress,
        DataTypes.BetParticipant participant
    );

    address private _betCheckerAddress;
    address private _contestAddress;
    address private _usageAddress;
    uint _contestFeePercent;
    uint _usageFeePercent;
    Counters.Counter private _tokenIds;
    mapping(uint256 => DataTypes.BetParams) internal _tokenParams;
    mapping(uint256 => DataTypes.BetParticipant[]) internal _tokenParticipants;

    constructor(
        address betCheckerAddress,
        address contestAddress,
        address usageAddress,
        uint contestFeePercent,
        uint usageFeePercent
    ) ERC721("dearweb3ibet bet", "DW3IBBET") {
        _betCheckerAddress = betCheckerAddress;
        _contestAddress = contestAddress;
        _usageAddress = usageAddress;
        _contestFeePercent = contestFeePercent;
        _usageFeePercent = usageFeePercent;
    }

    // TODO: Check that target timestamp is not passed
    // TODO: Check that participation deadline timestamp is not passed
    // TODO: Check that symbol is supported by bet checker contract
    function create(
        string memory uri,
        uint fee,
        string memory symbol,
        int targetMinPrice,
        int targetMaxPrice,
        uint targetTimestamp,
        uint participationDeadlineTimestamp
    ) public payable returns (uint256) {
        // Checks
        require(msg.value == fee, "message value is not equal to fee");
        // Update counter
        _tokenIds.increment();
        // Mint token
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        // Set params
        DataTypes.BetParams memory tokenParams = DataTypes.BetParams(
            block.timestamp,
            msg.sender,
            fee,
            symbol,
            targetMinPrice,
            targetMaxPrice,
            targetTimestamp,
            participationDeadlineTimestamp,
            fee,
            0,
            false,
            false
        );
        _tokenParams[newTokenId] = tokenParams;
        emit ParamsSet(newTokenId, tokenParams);
        // Add participant
        DataTypes.BetParticipant memory tokenParticipant = DataTypes
            .BetParticipant(block.timestamp, msg.sender, fee, true, 0);
        _tokenParticipants[newTokenId].push(tokenParticipant);
        emit ParticipantSet(newTokenId, msg.sender, tokenParticipant);
        // Set uri
        _setTokenURI(newTokenId, uri);
        emit URISet(newTokenId, uri);
        // Return
        return newTokenId;
    }

    // TODO: Check that bet is not closed
    // TODO: Check that message sender is not bet participant
    // TODO: Check that participation deadline timestamp allows to take part
    function takePart(
        uint256 tokenId,
        uint fee,
        bool isFeeForSuccess
    ) public payable {
        // Checks
        require(_exists(tokenId), "token is not exists");
        require(msg.value == fee, "message value is not equal to fee");
        // Add participant
        DataTypes.BetParticipant memory tokenParticipant = DataTypes
            .BetParticipant(
                block.timestamp,
                msg.sender,
                fee,
                isFeeForSuccess,
                0
            );
        _tokenParticipants[tokenId].push(tokenParticipant);
        emit ParticipantSet(tokenId, msg.sender, tokenParticipant);
        // Update token params
        DataTypes.BetParams storage tokenParams = _tokenParams[tokenId];
        if (isFeeForSuccess) {
            tokenParams.feeForSuccess += fee;
        } else {
            tokenParams.feeForFailure += fee;
        }
        emit ParamsSet(tokenId, tokenParams);
    }

    // TODO: Check that bet is not closed
    // TODO: Check that target date allows close bet
    // TODO: Test function if bet hasn't winners
    function close(uint256 tokenId) public {
        // Checks
        require(_exists(tokenId), "token is not exists");
        // Define whether a bet is successful or not
        DataTypes.BetParams storage tokenParams = _tokenParams[tokenId];
        (bool isBetSuccessful, , ) = IBetChecker(_betCheckerAddress)
            .isPriceExist(
                tokenParams.symbol,
                tokenParams.targetTimestamp,
                tokenParams.targetMinPrice,
                tokenParams.targetMaxPrice
            );
        // Update token params
        tokenParams.isClosed = true;
        tokenParams.isSuccessful = isBetSuccessful;
        emit ParamsSet(tokenId, tokenParams);
        // Define fees for contest, usage and winners
        uint feeForContest;
        uint feeForUsage;
        uint feeForWinners;
        if (isBetSuccessful) {
            feeForContest =
                (tokenParams.feeForFailure * _contestFeePercent) /
                100;
            feeForUsage = (tokenParams.feeForFailure * _usageFeePercent) / 100;
            feeForWinners =
                tokenParams.feeForFailure -
                feeForContest -
                feeForUsage;
        } else {
            feeForContest =
                (tokenParams.feeForSuccess * _contestFeePercent) /
                100;
            feeForUsage = (tokenParams.feeForSuccess * _usageFeePercent) / 100;
            feeForWinners =
                tokenParams.feeForSuccess -
                feeForContest -
                feeForUsage;
        }
        // Send fee to contest contract
        bool sent;
        (sent, ) = _contestAddress.call{value: feeForContest}("");
        require(sent, "failed to send fee to contest");
        // Send fee to usage contract
        (sent, ) = _usageAddress.call{value: feeForUsage}("");
        require(sent, "failed to send fee to usage");
        // Send fee and winning to winners
        uint winnersNumber;
        for (uint i = 0; i < _tokenParticipants[tokenId].length; i++) {
            DataTypes.BetParticipant storage participant = _tokenParticipants[
                tokenId
            ][i];
            // Calculate winning
            uint winning;
            if (participant.isFeeForSuccess && isBetSuccessful) {
                winning =
                    (participant.fee * feeForWinners) /
                    tokenParams.feeForSuccess;
            }
            if (!participant.isFeeForSuccess && !isBetSuccessful) {
                winning =
                    (participant.fee * feeForWinners) /
                    tokenParams.feeForFailure;
            }
            if (winning != 0) {
                // Save winning
                participant.winning = winning;
                emit ParticipantSet(
                    tokenId,
                    participant.accountAddress,
                    participant
                );
                // Send fee and winning
                (sent, ) = participant.accountAddress.call{
                    value: (participant.fee + winning)
                }("");
                require(sent, "failed to send fee and winning to winners");
                // Increase number of winners
                winnersNumber++;
            }
        }
        // Send participants and their winnings contest contract
        address[] memory participantAddresses = new address[](
            _tokenParticipants[tokenId].length
        );
        uint[] memory participantWinnings = new uint[](
            _tokenParticipants[tokenId].length
        );
        for (uint i = 0; i < _tokenParticipants[tokenId].length; i++) {
            DataTypes.BetParticipant memory participant = _tokenParticipants[
                tokenId
            ][i];
            participantAddresses[i] = participant.accountAddress;
            participantWinnings[i] = participant.winning;
        }
        IContest(_contestAddress).processBetParticipants(
            participantAddresses,
            participantWinnings
        );
    }

    function getBetCheckerAddress() public view returns (address) {
        return _betCheckerAddress;
    }

    function setBetCheckerAddress(address betCheckerAddress) public onlyOwner {
        _betCheckerAddress = betCheckerAddress;
    }

    function getContestAddress() public view returns (address) {
        return _contestAddress;
    }

    function setContestAddress(address contestAddress) public onlyOwner {
        _contestAddress = contestAddress;
    }

    function getUsageAddress() public view returns (address) {
        return _usageAddress;
    }

    function setUsageAddress(address usageAddress) public onlyOwner {
        _usageAddress = usageAddress;
    }

    function getContestFeePercent() public view returns (uint) {
        return _contestFeePercent;
    }

    function setContestFeePercent(uint contestFeePercent) public onlyOwner {
        _contestFeePercent = contestFeePercent;
    }

    function getUsageFeePercent() public view returns (uint) {
        return _usageFeePercent;
    }

    function setUsageFeePercent(uint usageFeePercent) public onlyOwner {
        _usageFeePercent = usageFeePercent;
    }

    function getParams(
        uint256 tokenId
    ) public view returns (DataTypes.BetParams memory) {
        return _tokenParams[tokenId];
    }

    function getParticipants(
        uint256 tokenId
    ) public view returns (DataTypes.BetParticipant[] memory) {
        return _tokenParticipants[tokenId];
    }

    function getBetCheckerFeedAddress(
        string memory feedSymbol
    ) public view returns (address) {
        return IBetChecker(_betCheckerAddress).getFeedAddress(feedSymbol);
    }
}

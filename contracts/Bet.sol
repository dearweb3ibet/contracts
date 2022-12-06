// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/BetCheckerInterface.sol";

contract Bet is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    struct Params {
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

    struct Participant {
        uint addedTimestamp;
        address accountAddress;
        uint fee;
        bool isFeeForSuccess;
        uint winning;
    }

    event URISet(uint256 indexed tokenId, string tokenURI);
    event ParamsSet(uint256 indexed tokenId, Params params);
    event ParticipantSet(uint256 indexed tokenId, Participant participant);

    address private _betCheckerAddress;
    address private _contestAddress;
    address private _usageAddress;
    uint _contestFeePercent;
    uint _usageFeePercent;
    Counters.Counter private _tokenIds;
    mapping(uint256 => Params) internal _tokenParams;
    mapping(uint256 => Participant[]) internal _tokenParticipants;

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
        Params memory tokenParams = Params(
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
        Participant memory tokenParticipant = Participant(
            block.timestamp,
            msg.sender,
            fee,
            true,
            0
        );
        _tokenParticipants[newTokenId].push(tokenParticipant);
        emit ParticipantSet(newTokenId, tokenParticipant);
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
        Participant memory tokenParticipant = Participant(
            block.timestamp,
            msg.sender,
            fee,
            isFeeForSuccess,
            0
        );
        _tokenParticipants[tokenId].push(tokenParticipant);
        emit ParticipantSet(tokenId, tokenParticipant);
        // Update token params
        Params storage tokenParams = _tokenParams[tokenId];
        if (isFeeForSuccess) {
            tokenParams.feeForSuccess += fee;
        } else {
            tokenParams.feeForFailure += fee;
        }
        emit ParamsSet(tokenId, tokenParams);
    }

    // TODO: Check that bet is not closed
    // TODO: Check that target date allows close bet
    function close(uint256 tokenId) public {
        // Checks
        require(_exists(tokenId), "token is not exists");
        // Define whether a bet is successful or not
        Params storage tokenParams = _tokenParams[tokenId];
        (bool isBetSuccessful, , ) = BetCheckerInterface(_betCheckerAddress)
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
        for (uint i = 0; i < _tokenParticipants[tokenId].length; i++) {
            Participant storage participant = _tokenParticipants[tokenId][i];
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
                emit ParticipantSet(tokenId, participant);
                // Send fee and winning
                (sent, ) = participant.accountAddress.call{
                    value: (participant.fee + winning)
                }("");
                require(sent, "failed to send fee and winning to winners");
            }
        }
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

    function getParams(uint256 tokenId) public view returns (Params memory) {
        return _tokenParams[tokenId];
    }

    function getParticipants(
        uint256 tokenId
    ) public view returns (Participant[] memory) {
        return _tokenParticipants[tokenId];
    }

    function getBetCheckerFeedAddress(
        string memory feedSymbol
    ) public view returns (address) {
        return
            BetCheckerInterface(_betCheckerAddress).getFeedAddress(feedSymbol);
    }
}

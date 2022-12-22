// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IBetChecker.sol";
import "./interfaces/IHub.sol";
import "./interfaces/IContest.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Events.sol";
import "./libraries/Errors.sol";

/**
 * Contract for create, close and participate in bets.
 */
contract Bet is ERC721URIStorageUpgradeable, OwnableUpgradeable {
    using Counters for Counters.Counter;

    address private _hubAddress;
    uint private _contestFeePercent;
    uint private _usageFeePercent;
    Counters.Counter private _counter;
    mapping(uint256 => DataTypes.BetParams) private _params;
    mapping(uint256 => DataTypes.BetParticipant[]) private _participants;

    function initialize(
        address hubAddress,
        uint contestFeePercent,
        uint usageFeePercent
    ) public initializer {
        __ERC721_init("dearweb3ibet bet", "DW3IBBET");
        __Ownable_init();
        _hubAddress = hubAddress;
        _contestFeePercent = contestFeePercent;
        _usageFeePercent = usageFeePercent;
    }

    // TODO: Check that message value greater than 0
    // TODO: Check that target timestamp is not passed
    // TODO: Check that participation deadline timestamp is not passed
    // TODO: Check that symbol is supported by bet checker contract
    // TODO: Check that target min price should be less then target max price
    // TODO: Check that bet checker can process input symbol
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
        require(msg.value == fee, Errors.MESSAGE_VALUE_IS_INCORRECT);
        // Update counter
        _counter.increment();
        // Mint token
        uint256 newTokenId = _counter.current();
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
        _params[newTokenId] = tokenParams;
        emit Events.BetParamsSet(newTokenId, tokenParams);
        // Add participant
        DataTypes.BetParticipant memory tokenParticipant = DataTypes
            .BetParticipant(block.timestamp, msg.sender, fee, true, 0);
        _participants[newTokenId].push(tokenParticipant);
        emit Events.BetParticipantSet(newTokenId, msg.sender, tokenParticipant);
        // Set uri
        _setTokenURI(newTokenId, uri);
        emit Events.URISet(newTokenId, uri);
        // Return
        return newTokenId;
    }

    // TODO: Check that bet is not closed
    // TODO: Check that message sender is not bet participant
    // TODO: Check that participation deadline timestamp allows to take part
    // TODO: Check that message sender is not a participation
    function takePart(
        uint256 tokenId,
        uint fee,
        bool isFeeForSuccess
    ) public payable {
        // Checks
        require(_exists(tokenId), Errors.TOKEN_DOES_NOT_EXIST);
        require(msg.value == fee, Errors.MESSAGE_VALUE_IS_INCORRECT);
        // Add participant
        DataTypes.BetParticipant memory tokenParticipant = DataTypes
            .BetParticipant(
                block.timestamp,
                msg.sender,
                fee,
                isFeeForSuccess,
                0
            );
        _participants[tokenId].push(tokenParticipant);
        emit Events.BetParticipantSet(tokenId, msg.sender, tokenParticipant);
        // Update token params
        DataTypes.BetParams storage tokenParams = _params[tokenId];
        if (isFeeForSuccess) {
            tokenParams.feeForSuccess += fee;
        } else {
            tokenParams.feeForFailure += fee;
        }
        emit Events.BetParamsSet(tokenId, tokenParams);
    }

    // TODO: Check that bet is not closed
    // TODO: Check that target date allows close bet
    // TODO: Test function if bet hasn't winners
    function close(uint256 tokenId) public {
        // Checks
        require(_exists(tokenId), Errors.TOKEN_DOES_NOT_EXIST);
        // Load token params
        DataTypes.BetParams storage tokenParams = _params[tokenId];
        // Define whether a bet is successful or not
        IBetChecker betChecker = IBetChecker(
            IHub(_hubAddress).getBetCheckerAddress()
        );
        (bool isBetSuccessful, , ) = betChecker.isPriceExist(
            tokenParams.symbol,
            tokenParams.targetTimestamp,
            tokenParams.targetMinPrice,
            tokenParams.targetMaxPrice
        );
        // Update token params
        tokenParams.isClosed = true;
        tokenParams.isSuccessful = isBetSuccessful;
        emit Events.BetParamsSet(tokenId, tokenParams);
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
        (sent, ) = IHub(_hubAddress).getContestAddress().call{
            value: feeForContest
        }("");
        require(sent, Errors.FAILED_TO_SEND_FEE_TO_CONTEST);
        // Send fee to usage contract
        (sent, ) = IHub(_hubAddress).getUsageAddress().call{value: feeForUsage}(
            ""
        );
        require(sent, Errors.FAILED_TO_SEND_FEE_TO_USAGE);
        // Send fee and winning to winners
        uint winnersNumber;
        for (uint i = 0; i < _participants[tokenId].length; i++) {
            DataTypes.BetParticipant storage participant = _participants[
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
                emit Events.BetParticipantSet(
                    tokenId,
                    participant.accountAddress,
                    participant
                );
                // Send fee and winning
                (sent, ) = participant.accountAddress.call{
                    value: (participant.fee + winning)
                }("");
                require(sent, Errors.FAILED_TO_SEND_FEE_AND_WINNING_TO_WINNERS);
                // Increase number of winners
                winnersNumber++;
            }
        }
        // Send participants and their winnings contest contract
        address[] memory participantAddresses = new address[](
            _participants[tokenId].length
        );
        uint[] memory participantWinnings = new uint[](
            _participants[tokenId].length
        );
        for (uint i = 0; i < _participants[tokenId].length; i++) {
            DataTypes.BetParticipant memory participant = _participants[
                tokenId
            ][i];
            participantAddresses[i] = participant.accountAddress;
            participantWinnings[i] = participant.winning;
        }
        IContest(IHub(_hubAddress).getContestAddress()).processBetParticipants(
            participantAddresses,
            participantWinnings
        );
    }

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    function getHubAddress() public view returns (address) {
        return _hubAddress;
    }

    function setHubAddress(address hubAddress) public onlyOwner {
        _hubAddress = hubAddress;
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
        return _params[tokenId];
    }

    function getParticipants(
        uint256 tokenId
    ) public view returns (DataTypes.BetParticipant[] memory) {
        return _participants[tokenId];
    }
}

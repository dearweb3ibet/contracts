// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/BetCheckerInterface.sol";

contract Bet is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    struct Params {
        uint createdDate;
        string symbol;
        int minPrice;
        int maxPrice;
        uint dayStartTimestamp;
        uint rate;
        address firstMember;
        address secondMember;
        address winner;
        uint winning;
    }

    event URISet(uint256 indexed tokenId, string tokenURI);

    Counters.Counter private _tokenIds;
    address private _betCheckerAddress;
    uint _fee;
    mapping(uint256 => Params) internal _tokenParams;

    constructor(address betCheckerAddress, uint fee)
        ERC721("dearweb3ibet bet", "DW3IBBET")
    {
        _betCheckerAddress = betCheckerAddress;
        _fee = fee;
    }

    function create(
        string memory uri,
        string memory symbol,
        int minPrice,
        int maxPrice,
        uint dayStartTimestamp,
        uint rate
    ) public payable returns (uint256) {
        // Check msg value
        require(msg.value == rate, "message value is incorrect");
        // Update counter
        _tokenIds.increment();
        // Mint token
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        // Set params
        _tokenParams[newTokenId] = Params(
            block.timestamp,
            symbol,
            minPrice,
            maxPrice,
            dayStartTimestamp,
            rate,
            msg.sender,
            address(0),
            address(0),
            0
        );
        // Set uri
        _setTokenURI(newTokenId, uri);
        emit URISet(newTokenId, uri);
        // Return
        return newTokenId;
    }

    // TODO: Check that second member is not first member
    function accept(uint256 tokenId) public payable {
        // Try find token params
        Params storage tokenParams = _tokenParams[tokenId];
        require(tokenParams.rate > 0, "token is not found");
        require(tokenParams.winner == address(0), "token already has winner");
        // Check msg value
        require(msg.value == tokenParams.rate, "message value is incorrect");
        // Update params
        tokenParams.secondMember = msg.sender;
    }

    // TODO: Check that token has both members
    // TODO: Emit event with winner and winning size
    // TODO: Send fee to another contract to share it with top accounts
    function verify(uint256 tokenId) public payable {
        // Try find token params
        Params storage tokenParams = _tokenParams[tokenId];
        require(tokenParams.rate > 0, "token is not found");
        require(tokenParams.winner == address(0), "token already has winner");
        // Verify token using bet checker
        (bool verifyResult, , ) = BetCheckerInterface(_betCheckerAddress)
            .isPriceExist(
                tokenParams.symbol,
                tokenParams.dayStartTimestamp,
                tokenParams.minPrice,
                tokenParams.maxPrice
            );
        // Define winner
        if (verifyResult) {
            tokenParams.winner = tokenParams.firstMember;
        } else {
            tokenParams.winner = tokenParams.secondMember;
        }
        // Define winning
        tokenParams.winning = (tokenParams.rate * 2 * (100 - _fee)) / 100;
        // Send winning to winner
        (bool sent, ) = tokenParams.winner.call{value: tokenParams.winning}("");
        require(sent, "failed to send winning");
    }

    function getBetCheckerAddress() public view returns (address) {
        return _betCheckerAddress;
    }

    function setBetCheckerAddress(address betCheckerAddress) public onlyOwner {
        _betCheckerAddress = betCheckerAddress;
    }

    function getFee() public view returns (uint) {
        return _fee;
    }

    function setFee(uint fee) public onlyOwner {
        _fee = fee;
    }

    function getParams(uint256 tokenId) public view returns (Params memory) {
        return _tokenParams[tokenId];
    }

    function getBetCheckerFeedAddress(string memory feedSymbol)
        public
        view
        returns (address)
    {
        return
            BetCheckerInterface(_betCheckerAddress).getFeedAddress(feedSymbol);
    }
}

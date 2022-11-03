// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/BetCheckerInterface.sol";

contract Bet is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    struct Params {
        string symbol;
        int minPrice;
        int maxPrice;
        uint dayStartTimestamp;
        uint rate;
        address firstMember;
        address secondMember;
        address winner;
    }

    event URISet(uint256 indexed tokenId, string tokenURI);

    Counters.Counter private _tokenIds;
    address private _betCheckerAddress;
    mapping(uint256 => Params) internal _tokenParams;

    constructor(address betCheckerAddress)
        ERC721("dearweb3ibet token", "DW3IBT")
    {
        _betCheckerAddress = betCheckerAddress;
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
            symbol,
            minPrice,
            maxPrice,
            dayStartTimestamp,
            rate,
            msg.sender,
            address(0),
            address(0)
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
        // Send winning to winner
        (bool sent, ) = tokenParams.winner.call{value: tokenParams.rate * 2}(
            ""
        );
        require(sent, "failed to send winning");
    }

    function getBetCheckerAddress() public view returns (address) {
        return _betCheckerAddress;
    }

    function setBetCheckerAddress(address betCheckerAddress) public onlyOwner {
        _betCheckerAddress = betCheckerAddress;
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

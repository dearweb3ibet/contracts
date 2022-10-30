// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Bet is ERC721URIStorage {
    using Counters for Counters.Counter;

    struct Params {
        int minPrice;
        int maxPrice;
        uint dayStartTimestamp;
        uint rate;
        address firstMember;
        address secondMember;
    }

    event URISet(uint256 indexed tokenId, string tokenURI);

    Counters.Counter private _tokenIds;
    mapping(uint256 => Params) internal _tokenParams;

    constructor() ERC721("dearweb3ibet token", "DW3IBT") {}

    function create(
        string memory uri,
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
            minPrice,
            maxPrice,
            dayStartTimestamp,
            rate,
            msg.sender,
            address(0)
        );
        // Set uri
        _setTokenURI(newTokenId, uri);
        emit URISet(newTokenId, uri);
        // Return
        return newTokenId;
    }

    function accept(uint256 tokenId) public payable {
        // Try find token params
        Params storage tokenParams = _tokenParams[tokenId];
        require(tokenParams.rate > 0, "token is not found");
        // Check msg value
        require(msg.value == tokenParams.rate, "message value is incorrect");
        // Update params
        tokenParams.secondMember = msg.sender;
    }

    // TODO: implement function
    function verify() public {}

    function getParams(uint256 tokenId) public view returns (Params memory) {
        return _tokenParams[tokenId];
    }
}

// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Bio is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => uint256) internal _bioOwners;

    event URISet(uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("dearweb3ibet bio", "DW3IBBIO") {}

    /**
     * Set uri for message sender's token. Additionally mint token if required.
     */
    function setURI(string memory tokenURI) public {
        // Mint token if sender does not have it yet
        if (_bioOwners[msg.sender] == 0) {
            // Update counter
            _tokenIds.increment();
            // Mint token
            uint256 newItemId = _tokenIds.current();
            _mint(msg.sender, newItemId);
            _bioOwners[msg.sender] = newItemId;
            // Set URI
            _setURI(newItemId, tokenURI);
        }
        // Set URI if sender already have token
        else {
            _setURI(_bioOwners[msg.sender], tokenURI);
        }
    }

    /**
     * Set uri.
     */
    function _setURI(uint256 tokenId, string memory tokenURI) internal {
        _setTokenURI(tokenId, tokenURI);
        emit URISet(tokenId, tokenURI);
    }

    /**
     * Function before transfer.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
        // Check to allow only zero address transfer tokens
        require(from == address(0), "Token is non-transferable");
    }
}

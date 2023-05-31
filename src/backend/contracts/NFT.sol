// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint public tokenCount;

    constructor() ERC721("NFT Tutorial", "NFT_Tutorial") {}

    function mint(string memory _tokenUri) external returns (uint) {
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenUri);

        tokenCount++;

        return tokenCount;
    }
}

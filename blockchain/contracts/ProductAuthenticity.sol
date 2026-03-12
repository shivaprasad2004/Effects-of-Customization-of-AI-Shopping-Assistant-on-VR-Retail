// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProductAuthenticity
 * @dev Stores product provenance and authenticity certificates (IPFS hashes).
 */
contract ProductAuthenticity is Ownable {
    struct Product {
        string sku;
        string name;
        string certificateHash; // IPFS URI
        address manufacturer;
        uint256 timestamp;
        bool isVerified;
    }

    mapping(string => Product) private products;
    event ProductRegistered(string indexed sku, string certificateHash, address manufacturer);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Registers a new product authenticity certificate.
     */
    function registerProduct(string memory _sku, string memory _name, string memory _certHash) public onlyOwner {
        require(bytes(products[_sku].sku).length == 0, "Product already registered");
        
        products[_sku] = Product({
            sku: _sku,
            name: _name,
            certificateHash: _certHash,
            manufacturer: msg.sender,
            timestamp: block.timestamp,
            isVerified: true
        });

        emit ProductRegistered(_sku, _certHash, msg.sender);
    }

    /**
     * @dev Returns product authenticity details by SKU.
     */
    function verifyProduct(string memory _sku) public view returns (
        string memory name,
        string memory certHash,
        address manufacturer,
        uint256 timestamp,
        bool isVerified
    ) {
        Product memory p = products[_sku];
        require(bytes(p.sku).length != 0, "Product not found");
        return (p.name, p.certificateHash, p.manufacturer, p.timestamp, p.isVerified);
    }
}
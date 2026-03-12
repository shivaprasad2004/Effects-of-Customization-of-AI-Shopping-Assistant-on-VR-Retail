// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LoyaltyToken
 * @dev ERC-20 token for VR shopping rewards ($SHOP).
 */
contract LoyaltyToken is ERC20, Ownable {
    constructor() ERC20("VR Loyalty Token", "SHOP") Ownable(msg.sender) {}

    /**
     * @dev Mints reward tokens to a shopper. Only callable by the merchant/contract.
     */
    function mintReward(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Shoppers can burn tokens for discounts in the VR store.
     */
    function redeem(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
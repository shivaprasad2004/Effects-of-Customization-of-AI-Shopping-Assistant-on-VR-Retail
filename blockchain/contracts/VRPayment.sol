// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LoyaltyToken.sol";

/**
 * @title VRPayment
 * @dev Handles escrowed payments for virtual goods and distributes rewards.
 */
contract VRPayment is Ownable {
    LoyaltyToken public rewardToken;
    uint256 public rewardRate = 10; // 10 SHOP per 1 ETH spent

    event PaymentReceived(address indexed shopper, uint256 amount, string orderId);

    constructor(address _rewardTokenAddress) Ownable(msg.sender) {
        rewardToken = LoyaltyToken(_rewardTokenAddress);
    }

    /**
     * @dev Process payment and issue loyalty tokens.
     */
    function processPayment(string memory _orderId) public payable {
        require(msg.value > 0, "Payment must be greater than zero");
        
        // Reward user with loyalty tokens
        uint256 rewardAmount = (msg.value * rewardRate) / 1 ether;
        if (rewardAmount > 0) {
            rewardToken.mintReward(msg.sender, rewardAmount * (10**18));
        }

        emit PaymentReceived(msg.sender, msg.value, _orderId);
    }

    /**
     * @dev Withdraw funds to merchant wallet.
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

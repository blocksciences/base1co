// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KYCRegistry
 * @dev On-chain registry for KYC-approved addresses
 * @notice Only approved addresses can participate in token sales
 */
contract KYCRegistry is Ownable {
    // Mapping of address => KYC approval status
    mapping(address => bool) public isKYCApproved;
    
    // Mapping of address => geo-blocking status (true = blocked)
    mapping(address => bool) public isGeoBlocked;
    
    // Events
    event KYCStatusUpdated(address indexed user, bool approved);
    event GeoBlockStatusUpdated(address indexed user, bool blocked);
    event BatchKYCUpdated(address[] users, bool approved);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Set KYC status for a single address
     * @param user Address to update
     * @param approved KYC approval status
     */
    function setKYCStatus(address user, bool approved) external onlyOwner {
        require(user != address(0), "Invalid address");
        isKYCApproved[user] = approved;
        emit KYCStatusUpdated(user, approved);
    }
    
    /**
     * @notice Batch update KYC status for multiple addresses
     * @param users Array of addresses to update
     * @param approved KYC approval status for all addresses
     */
    function batchSetKYCStatus(address[] calldata users, bool approved) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid address");
            isKYCApproved[users[i]] = approved;
        }
        emit BatchKYCUpdated(users, approved);
    }
    
    /**
     * @notice Set geo-blocking status for an address
     * @param user Address to update
     * @param blocked Geo-blocking status
     */
    function setGeoBlockStatus(address user, bool blocked) external onlyOwner {
        require(user != address(0), "Invalid address");
        isGeoBlocked[user] = blocked;
        emit GeoBlockStatusUpdated(user, blocked);
    }
    
    /**
     * @notice Check if an address is eligible (KYC approved and not geo-blocked)
     * @param user Address to check
     * @return bool Eligibility status
     */
    function isEligible(address user) external view returns (bool) {
        return isKYCApproved[user] && !isGeoBlocked[user];
    }
}
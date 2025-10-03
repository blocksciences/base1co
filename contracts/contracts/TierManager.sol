// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TierManager
 * @dev Manages user tiers and associated benefits across the platform
 * @notice Tracks and enforces tier-based benefits and privileges
 */
contract TierManager is Ownable, Pausable {
    
    // Tier enum matching StakingVault
    enum Tier { BRONZE, SILVER, GOLD, PLATINUM, DIAMOND }
    
    // Tier benefits structure
    struct TierBenefits {
        uint256 tradingFeeDiscount;      // Basis points (100 = 1% discount)
        uint256 withdrawalFeeDiscount;   // Basis points
        uint256 maxListingsPerMonth;     // Number of listings
        bool prioritySupport;            // Access to priority support
        bool earlyAccess;                // Early access to new features
        bool customBranding;             // Custom branding options
        uint256 referralBonus;           // Referral bonus percentage (basis points)
        uint256 votingPowerMultiplier;   // Governance voting multiplier (basis points, 10000 = 1x)
    }
    
    // Tier configurations
    mapping(Tier => TierBenefits) public tierBenefits;
    
    // User tier tracking
    mapping(address => Tier) public userTier;
    mapping(address => uint256) public tierUpdateTime;
    
    // Authorized contracts that can update tiers
    mapping(address => bool) public authorizedUpdaters;
    
    // Statistics
    mapping(Tier => uint256) public tierUserCount;
    uint256 public totalUsers;
    
    // Events
    event TierUpdated(address indexed user, Tier oldTier, Tier newTier);
    event TierBenefitsUpdated(Tier tier);
    event UpdaterAuthorized(address indexed updater, bool status);
    event BenefitUsed(address indexed user, string benefitType, uint256 value);
    
    /**
     * @dev Constructor initializes default tier benefits
     * @param initialOwner Address of contract owner
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        _initializeDefaultBenefits();
    }
    
    /**
     * @dev Initialize default tier benefits
     */
    function _initializeDefaultBenefits() internal {
        // BRONZE Tier
        tierBenefits[Tier.BRONZE] = TierBenefits({
            tradingFeeDiscount: 500,        // 5% discount
            withdrawalFeeDiscount: 0,       // No discount
            maxListingsPerMonth: 5,
            prioritySupport: false,
            earlyAccess: false,
            customBranding: false,
            referralBonus: 500,             // 5% bonus
            votingPowerMultiplier: 10000    // 1x voting power
        });
        
        // SILVER Tier
        tierBenefits[Tier.SILVER] = TierBenefits({
            tradingFeeDiscount: 1000,       // 10% discount
            withdrawalFeeDiscount: 500,     // 5% discount
            maxListingsPerMonth: 10,
            prioritySupport: false,
            earlyAccess: false,
            customBranding: false,
            referralBonus: 750,             // 7.5% bonus
            votingPowerMultiplier: 11000    // 1.1x voting power
        });
        
        // GOLD Tier
        tierBenefits[Tier.GOLD] = TierBenefits({
            tradingFeeDiscount: 2000,       // 20% discount
            withdrawalFeeDiscount: 1000,    // 10% discount
            maxListingsPerMonth: 25,
            prioritySupport: true,
            earlyAccess: true,
            customBranding: false,
            referralBonus: 1000,            // 10% bonus
            votingPowerMultiplier: 12500    // 1.25x voting power
        });
        
        // PLATINUM Tier
        tierBenefits[Tier.PLATINUM] = TierBenefits({
            tradingFeeDiscount: 3500,       // 35% discount
            withdrawalFeeDiscount: 2000,    // 20% discount
            maxListingsPerMonth: 50,
            prioritySupport: true,
            earlyAccess: true,
            customBranding: true,
            referralBonus: 1500,            // 15% bonus
            votingPowerMultiplier: 15000    // 1.5x voting power
        });
        
        // DIAMOND Tier
        tierBenefits[Tier.DIAMOND] = TierBenefits({
            tradingFeeDiscount: 5000,       // 50% discount
            withdrawalFeeDiscount: 3000,    // 30% discount
            maxListingsPerMonth: 100,
            prioritySupport: true,
            earlyAccess: true,
            customBranding: true,
            referralBonus: 2000,            // 20% bonus
            votingPowerMultiplier: 20000    // 2x voting power
        });
    }
    
    /**
     * @dev Update user tier (only authorized updaters)
     * @param user Address of user
     * @param newTier New tier for user
     */
    function updateUserTier(address user, Tier newTier) external whenNotPaused {
        require(authorizedUpdaters[msg.sender], "Not authorized");
        require(user != address(0), "Invalid user address");
        
        Tier oldTier = userTier[user];
        
        // Update tier counts
        if (userTier[user] != newTier) {
            if (tierUpdateTime[user] > 0) {
                // Existing user changing tiers
                tierUserCount[oldTier]--;
            } else {
                // New user
                totalUsers++;
            }
            
            tierUserCount[newTier]++;
            userTier[user] = newTier;
            tierUpdateTime[user] = block.timestamp;
            
            emit TierUpdated(user, oldTier, newTier);
        }
    }
    
    /**
     * @dev Get user's tier benefits
     * @param user Address of user
     * @return TierBenefits struct
     */
    function getUserBenefits(address user) external view returns (TierBenefits memory) {
        return tierBenefits[userTier[user]];
    }
    
    /**
     * @dev Calculate trading fee after discount
     * @param user Address of user
     * @param baseFee Base fee in basis points
     * @return Discounted fee
     */
    function calculateTradingFee(address user, uint256 baseFee) external view returns (uint256) {
        TierBenefits memory benefits = tierBenefits[userTier[user]];
        uint256 discount = (baseFee * benefits.tradingFeeDiscount) / 10000;
        return baseFee - discount;
    }
    
    /**
     * @dev Calculate withdrawal fee after discount
     * @param user Address of user
     * @param baseFee Base fee in basis points
     * @return Discounted fee
     */
    function calculateWithdrawalFee(address user, uint256 baseFee) external view returns (uint256) {
        TierBenefits memory benefits = tierBenefits[userTier[user]];
        uint256 discount = (baseFee * benefits.withdrawalFeeDiscount) / 10000;
        return baseFee - discount;
    }
    
    /**
     * @dev Get user's voting power multiplier
     * @param user Address of user
     * @return Voting power multiplier in basis points
     */
    function getVotingPowerMultiplier(address user) external view returns (uint256) {
        return tierBenefits[userTier[user]].votingPowerMultiplier;
    }
    
    /**
     * @dev Check if user has priority support
     * @param user Address of user
     * @return Whether user has priority support
     */
    function hasPrioritySupport(address user) external view returns (bool) {
        return tierBenefits[userTier[user]].prioritySupport;
    }
    
    /**
     * @dev Check if user has early access
     * @param user Address of user
     * @return Whether user has early access
     */
    function hasEarlyAccess(address user) external view returns (bool) {
        return tierBenefits[userTier[user]].earlyAccess;
    }
    
    /**
     * @dev Check if user has custom branding
     * @param user Address of user
     * @return Whether user has custom branding
     */
    function hasCustomBranding(address user) external view returns (bool) {
        return tierBenefits[userTier[user]].customBranding;
    }
    
    /**
     * @dev Get user's max listings per month
     * @param user Address of user
     * @return Max listings allowed
     */
    function getMaxListingsPerMonth(address user) external view returns (uint256) {
        return tierBenefits[userTier[user]].maxListingsPerMonth;
    }
    
    /**
     * @dev Get user's referral bonus rate
     * @param user Address of user
     * @return Referral bonus in basis points
     */
    function getReferralBonus(address user) external view returns (uint256) {
        return tierBenefits[userTier[user]].referralBonus;
    }
    
    /**
     * @dev Update tier benefits configuration (owner only)
     * @param tier Tier to update
     * @param benefits New benefits configuration
     */
    function setTierBenefits(Tier tier, TierBenefits memory benefits) external onlyOwner {
        require(benefits.tradingFeeDiscount <= 10000, "Invalid trading fee discount");
        require(benefits.withdrawalFeeDiscount <= 10000, "Invalid withdrawal fee discount");
        require(benefits.referralBonus <= 10000, "Invalid referral bonus");
        require(benefits.votingPowerMultiplier > 0, "Invalid voting multiplier");
        require(benefits.maxListingsPerMonth > 0, "Invalid max listings");
        
        tierBenefits[tier] = benefits;
        
        emit TierBenefitsUpdated(tier);
    }
    
    /**
     * @dev Authorize contract to update user tiers
     * @param updater Address of updater contract
     * @param status Authorization status
     */
    function setAuthorizedUpdater(address updater, bool status) external onlyOwner {
        require(updater != address(0), "Invalid updater address");
        authorizedUpdaters[updater] = status;
        
        emit UpdaterAuthorized(updater, status);
    }
    
    /**
     * @dev Get tier distribution statistics
     * @return bronze, silver, gold, platinum, diamond user counts
     */
    function getTierDistribution() external view returns (
        uint256 bronze,
        uint256 silver,
        uint256 gold,
        uint256 platinum,
        uint256 diamond
    ) {
        bronze = tierUserCount[Tier.BRONZE];
        silver = tierUserCount[Tier.SILVER];
        gold = tierUserCount[Tier.GOLD];
        platinum = tierUserCount[Tier.PLATINUM];
        diamond = tierUserCount[Tier.DIAMOND];
    }
    
    /**
     * @dev Get user tier info
     * @param user Address of user
     * @return tier, updateTime, benefits
     */
    function getUserTierInfo(address user) external view returns (
        Tier tier,
        uint256 updateTime,
        TierBenefits memory benefits
    ) {
        tier = userTier[user];
        updateTime = tierUpdateTime[user];
        benefits = tierBenefits[tier];
    }
    
    /**
     * @dev Batch update user tiers (for migration or corrections)
     * @param users Array of user addresses
     * @param tiers Array of tiers
     */
    function batchUpdateTiers(
        address[] calldata users,
        Tier[] calldata tiers
    ) external onlyOwner {
        require(users.length == tiers.length, "Array length mismatch");
        require(users.length <= 100, "Batch too large");
        
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid user address");
            
            Tier oldTier = userTier[users[i]];
            
            if (tierUpdateTime[users[i]] > 0) {
                tierUserCount[oldTier]--;
            } else {
                totalUsers++;
            }
            
            tierUserCount[tiers[i]]++;
            userTier[users[i]] = tiers[i];
            tierUpdateTime[users[i]] = block.timestamp;
            
            emit TierUpdated(users[i], oldTier, tiers[i]);
        }
    }
    
    /**
     * @dev Get all benefits for a specific tier
     * @param tier Tier to query
     * @return TierBenefits struct
     */
    function getTierBenefits(Tier tier) external view returns (TierBenefits memory) {
        return tierBenefits[tier];
    }
    
    /**
     * @dev Compare two users' tiers
     * @param user1 First user
     * @param user2 Second user
     * @return 1 if user1 has higher tier, -1 if user2 has higher tier, 0 if equal
     */
    function compareTiers(address user1, address user2) external view returns (int8) {
        Tier tier1 = userTier[user1];
        Tier tier2 = userTier[user2];
        
        if (tier1 > tier2) return 1;
        if (tier1 < tier2) return -1;
        return 0;
    }
    
    /**
     * @dev Pause tier updates (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause tier updates
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StakingVault
 * @dev Tiered staking system with multiple lock periods and rewards
 * @notice Stake LIST tokens to earn rewards and unlock platform benefits
 */
contract StakingVault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Stake tiers
    enum StakeTier { BRONZE, SILVER, GOLD, PLATINUM, DIAMOND }
    
    // Lock periods (in seconds)
    uint256 public constant LOCK_30_DAYS = 30 days;
    uint256 public constant LOCK_90_DAYS = 90 days;
    uint256 public constant LOCK_180_DAYS = 180 days;
    uint256 public constant LOCK_365_DAYS = 365 days;
    
    // Tier thresholds (tokens with decimals)
    uint256 public constant BRONZE_THRESHOLD = 10_000 * 10**18;      // 10K
    uint256 public constant SILVER_THRESHOLD = 50_000 * 10**18;      // 50K
    uint256 public constant GOLD_THRESHOLD = 100_000 * 10**18;       // 100K
    uint256 public constant PLATINUM_THRESHOLD = 500_000 * 10**18;   // 500K
    uint256 public constant DIAMOND_THRESHOLD = 1_000_000 * 10**18;  // 1M
    
    // APY rates (basis points, 100 = 1%)
    mapping(uint256 => uint256) public lockPeriodAPY;
    
    // Tier multipliers (basis points, 10000 = 1x)
    mapping(StakeTier => uint256) public tierMultipliers;
    
    IERC20 public immutable listToken;
    address public tierManager;
    address public feeDistributor;
    
    struct Stake {
        uint256 amount;
        uint256 lockPeriod;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 accumulatedRewards;
        StakeTier tier;
        bool active;
    }
    
    // User stakes mapping: user => stakeId => Stake
    mapping(address => mapping(uint256 => Stake)) public stakes;
    mapping(address => uint256) public userStakeCount;
    mapping(address => uint256) public totalStakedByUser;
    
    // Global stats
    uint256 public totalStaked;
    uint256 public totalRewardsPaid;
    uint256 public totalStakers;
    mapping(address => bool) public hasStaked;
    
    // Reward pool
    uint256 public rewardPool;
    uint256 public emergencyWithdrawPenalty = 2000; // 20% penalty
    
    // Events
    event Staked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 lockPeriod, StakeTier tier);
    event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 indexed stakeId, uint256 rewards);
    event EmergencyWithdraw(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 penalty);
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event APYUpdated(uint256 lockPeriod, uint256 newAPY);
    event TierMultiplierUpdated(StakeTier tier, uint256 multiplier);
    
    /**
     * @dev Constructor
     * @param _listToken Address of LIST token
     * @param initialOwner Address of contract owner
     */
    constructor(address _listToken, address initialOwner) Ownable(initialOwner) {
        require(_listToken != address(0), "Invalid token address");
        listToken = IERC20(_listToken);
        
        // Initialize default APY rates (basis points)
        lockPeriodAPY[LOCK_30_DAYS] = 500;    // 5% APY
        lockPeriodAPY[LOCK_90_DAYS] = 1000;   // 10% APY
        lockPeriodAPY[LOCK_180_DAYS] = 1500;  // 15% APY
        lockPeriodAPY[LOCK_365_DAYS] = 2500;  // 25% APY
        
        // Initialize tier multipliers (basis points, 10000 = 1x)
        tierMultipliers[StakeTier.BRONZE] = 10000;   // 1x
        tierMultipliers[StakeTier.SILVER] = 11000;   // 1.1x
        tierMultipliers[StakeTier.GOLD] = 12500;     // 1.25x
        tierMultipliers[StakeTier.PLATINUM] = 15000; // 1.5x
        tierMultipliers[StakeTier.DIAMOND] = 20000;  // 2x
    }
    
    /**
     * @dev Stake tokens with selected lock period
     * @param amount Amount to stake
     * @param lockPeriod Lock period (must be valid)
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(isValidLockPeriod(lockPeriod), "Invalid lock period");
        
        // Track first-time stakers
        if (!hasStaked[msg.sender]) {
            hasStaked[msg.sender] = true;
            totalStakers++;
        }
        
        // Calculate tier
        uint256 newTotal = totalStakedByUser[msg.sender] + amount;
        StakeTier tier = calculateTier(newTotal);
        
        // Create stake
        uint256 stakeId = userStakeCount[msg.sender];
        stakes[msg.sender][stakeId] = Stake({
            amount: amount,
            lockPeriod: lockPeriod,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            accumulatedRewards: 0,
            tier: tier,
            active: true
        });
        
        userStakeCount[msg.sender]++;
        totalStakedByUser[msg.sender] += amount;
        totalStaked += amount;
        
        // Transfer tokens
        listToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Notify TierManager if set
        if (tierManager != address(0)) {
            ITierManager(tierManager).updateUserTier(msg.sender, tier);
        }
        
        emit Staked(msg.sender, stakeId, amount, lockPeriod, tier);
    }
    
    /**
     * @dev Unstake tokens after lock period
     * @param stakeId ID of stake to unstake
     */
    function unstake(uint256 stakeId) external nonReentrant {
        Stake storage userStake = stakes[msg.sender][stakeId];
        require(userStake.active, "Stake not active");
        require(
            block.timestamp >= userStake.startTime + userStake.lockPeriod,
            "Lock period not ended"
        );
        
        uint256 amount = userStake.amount;
        uint256 rewards = calculateRewards(msg.sender, stakeId);
        
        // Update state
        userStake.active = false;
        totalStakedByUser[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Pay rewards if available
        uint256 totalPayout = amount;
        if (rewards > 0 && rewards <= rewardPool) {
            userStake.accumulatedRewards += rewards;
            rewardPool -= rewards;
            totalRewardsPaid += rewards;
            totalPayout += rewards;
        }
        
        // Transfer tokens
        listToken.safeTransfer(msg.sender, totalPayout);
        
        // Update tier
        StakeTier newTier = calculateTier(totalStakedByUser[msg.sender]);
        if (tierManager != address(0)) {
            ITierManager(tierManager).updateUserTier(msg.sender, newTier);
        }
        
        emit Unstaked(msg.sender, stakeId, amount, rewards);
    }
    
    /**
     * @dev Claim accumulated rewards without unstaking
     * @param stakeId ID of stake to claim rewards from
     */
    function claimRewards(uint256 stakeId) external nonReentrant {
        Stake storage userStake = stakes[msg.sender][stakeId];
        require(userStake.active, "Stake not active");
        
        uint256 rewards = calculateRewards(msg.sender, stakeId);
        require(rewards > 0, "No rewards to claim");
        require(rewards <= rewardPool, "Insufficient reward pool");
        
        // Update state
        userStake.lastClaimTime = block.timestamp;
        userStake.accumulatedRewards += rewards;
        rewardPool -= rewards;
        totalRewardsPaid += rewards;
        
        // Transfer rewards
        listToken.safeTransfer(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, stakeId, rewards);
    }
    
    /**
     * @dev Emergency withdraw with penalty (before lock period ends)
     * @param stakeId ID of stake to emergency withdraw
     */
    function emergencyWithdraw(uint256 stakeId) external nonReentrant {
        Stake storage userStake = stakes[msg.sender][stakeId];
        require(userStake.active, "Stake not active");
        require(
            block.timestamp < userStake.startTime + userStake.lockPeriod,
            "Use regular unstake"
        );
        
        uint256 amount = userStake.amount;
        uint256 penalty = (amount * emergencyWithdrawPenalty) / 10000;
        uint256 amountAfterPenalty = amount - penalty;
        
        // Update state
        userStake.active = false;
        totalStakedByUser[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer penalty to reward pool
        rewardPool += penalty;
        
        // Transfer remaining amount to user
        listToken.safeTransfer(msg.sender, amountAfterPenalty);
        
        // Update tier
        StakeTier newTier = calculateTier(totalStakedByUser[msg.sender]);
        if (tierManager != address(0)) {
            ITierManager(tierManager).updateUserTier(msg.sender, newTier);
        }
        
        emit EmergencyWithdraw(msg.sender, stakeId, amountAfterPenalty, penalty);
    }
    
    /**
     * @dev Calculate pending rewards for a stake
     * @param user Address of user
     * @param stakeId ID of stake
     * @return Pending rewards
     */
    function calculateRewards(address user, uint256 stakeId) public view returns (uint256) {
        Stake memory userStake = stakes[user][stakeId];
        if (!userStake.active) return 0;
        
        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        uint256 baseAPY = lockPeriodAPY[userStake.lockPeriod];
        uint256 tierMultiplier = tierMultipliers[userStake.tier];
        
        // Calculate rewards: (amount * APY * tierMultiplier * time) / (365 days * 10000 * 10000)
        uint256 rewards = (userStake.amount * baseAPY * tierMultiplier * timeStaked) 
            / (365 days * 10000 * 10000);
        
        return rewards;
    }
    
    /**
     * @dev Calculate tier based on total staked amount
     * @param totalAmount Total staked amount
     * @return Stake tier
     */
    function calculateTier(uint256 totalAmount) public pure returns (StakeTier) {
        if (totalAmount >= DIAMOND_THRESHOLD) return StakeTier.DIAMOND;
        if (totalAmount >= PLATINUM_THRESHOLD) return StakeTier.PLATINUM;
        if (totalAmount >= GOLD_THRESHOLD) return StakeTier.GOLD;
        if (totalAmount >= SILVER_THRESHOLD) return StakeTier.SILVER;
        if (totalAmount >= BRONZE_THRESHOLD) return StakeTier.BRONZE;
        revert("Amount below minimum stake");
    }
    
    /**
     * @dev Check if lock period is valid
     * @param lockPeriod Lock period to check
     * @return Whether lock period is valid
     */
    function isValidLockPeriod(uint256 lockPeriod) public pure returns (bool) {
        return lockPeriod == LOCK_30_DAYS || 
               lockPeriod == LOCK_90_DAYS || 
               lockPeriod == LOCK_180_DAYS || 
               lockPeriod == LOCK_365_DAYS;
    }
    
    /**
     * @dev Get user's active stakes
     * @param user Address of user
     * @return Array of stake IDs
     */
    function getUserActiveStakes(address user) external view returns (uint256[] memory) {
        uint256 count = userStakeCount[user];
        uint256 activeCount = 0;
        
        // Count active stakes
        for (uint256 i = 0; i < count; i++) {
            if (stakes[user][i].active) {
                activeCount++;
            }
        }
        
        // Populate array
        uint256[] memory activeStakes = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < count; i++) {
            if (stakes[user][i].active) {
                activeStakes[index] = i;
                index++;
            }
        }
        
        return activeStakes;
    }
    
    /**
     * @dev Get total pending rewards for user
     * @param user Address of user
     * @return Total pending rewards
     */
    function getTotalPendingRewards(address user) external view returns (uint256) {
        uint256 count = userStakeCount[user];
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < count; i++) {
            if (stakes[user][i].active) {
                totalRewards += calculateRewards(user, i);
            }
        }
        
        return totalRewards;
    }
    
    /**
     * @dev Fund reward pool
     * @param amount Amount to add to reward pool
     */
    function fundRewardPool(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        listToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        
        emit RewardPoolFunded(msg.sender, amount);
    }
    
    /**
     * @dev Set APY for lock period (owner only)
     * @param lockPeriod Lock period
     * @param apy APY in basis points
     */
    function setLockPeriodAPY(uint256 lockPeriod, uint256 apy) external onlyOwner {
        require(isValidLockPeriod(lockPeriod), "Invalid lock period");
        require(apy <= 10000, "APY too high"); // Max 100%
        lockPeriodAPY[lockPeriod] = apy;
        
        emit APYUpdated(lockPeriod, apy);
    }
    
    /**
     * @dev Set tier multiplier (owner only)
     * @param tier Stake tier
     * @param multiplier Multiplier in basis points
     */
    function setTierMultiplier(StakeTier tier, uint256 multiplier) external onlyOwner {
        require(multiplier >= 10000, "Multiplier must be >= 1x");
        require(multiplier <= 30000, "Multiplier too high"); // Max 3x
        tierMultipliers[tier] = multiplier;
        
        emit TierMultiplierUpdated(tier, multiplier);
    }
    
    /**
     * @dev Set TierManager contract address
     * @param _tierManager Address of TierManager
     */
    function setTierManager(address _tierManager) external onlyOwner {
        require(_tierManager != address(0), "Invalid address");
        tierManager = _tierManager;
    }
    
    /**
     * @dev Set FeeDistributor contract address
     * @param _feeDistributor Address of FeeDistributor
     */
    function setFeeDistributor(address _feeDistributor) external onlyOwner {
        require(_feeDistributor != address(0), "Invalid address");
        feeDistributor = _feeDistributor;
    }
    
    /**
     * @dev Set emergency withdraw penalty
     * @param penalty Penalty in basis points
     */
    function setEmergencyWithdrawPenalty(uint256 penalty) external onlyOwner {
        require(penalty <= 5000, "Penalty too high"); // Max 50%
        emergencyWithdrawPenalty = penalty;
    }
    
    /**
     * @dev Pause staking (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause staking
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

interface ITierManager {
    function updateUserTier(address user, StakingVault.StakeTier tier) external;
}
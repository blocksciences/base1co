// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PlatformStakingVault
 * @dev Staking contract for LIST tokens with lock periods and tier-based rewards
 */
contract PlatformStakingVault is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable listToken;
    
    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**18; // 100 LIST
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Lock period configurations
    struct LockPeriod {
        uint256 duration;      // Duration in seconds
        uint256 apyRate;       // APY rate (basis points, e.g., 500 = 5%)
        uint256 multiplier;    // Bonus multiplier (basis points, e.g., 10000 = 1.0x)
    }
    
    // User stake information
    struct Stake {
        uint256 amount;
        uint256 lockPeriodId;
        uint256 startTime;
        uint256 unlockTime;
        uint256 lastRewardClaim;
        uint256 totalRewardsClaimed;
    }
    
    // Lock period definitions
    mapping(uint256 => LockPeriod) public lockPeriods;
    uint256 public lockPeriodsCount;
    
    // User stakes: user => stake id => Stake
    mapping(address => mapping(uint256 => Stake)) public stakes;
    mapping(address => uint256) public stakeCount;
    
    // Total staked by each user
    mapping(address => uint256) public totalStakedByUser;
    
    // Global stats
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    // Reward pool balance
    uint256 public rewardPool;
    
    // Early staker bonus (expires after certain time)
    uint256 public earlyStakerBonusBps = 500; // 5% bonus
    uint256 public earlyStakerDeadline;
    
    // Events
    event Staked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 lockPeriodId);
    event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed stakeId, uint256 amount);
    event RewardsCompounded(address indexed user, uint256 indexed stakeId, uint256 amount);
    event RewardPoolFunded(uint256 amount);
    event LockPeriodAdded(uint256 indexed id, uint256 duration, uint256 apyRate);
    
    constructor(address _listToken) Ownable(msg.sender) {
        require(_listToken != address(0), "Invalid token address");
        listToken = IERC20(_listToken);
        
        // Set early staker deadline to 90 days from deployment
        earlyStakerDeadline = block.timestamp + 90 days;
        
        // Initialize default lock periods
        _addLockPeriod(0, 300, 10000);           // Flexible: 0 days, 3% APY, 1.0x multiplier
        _addLockPeriod(30 days, 500, 11000);     // 30 days: 5% APY, 1.1x multiplier
        _addLockPeriod(90 days, 1200, 13000);    // 90 days: 12% APY, 1.3x multiplier
        _addLockPeriod(180 days, 2500, 16000);   // 180 days: 25% APY, 1.6x multiplier
        _addLockPeriod(365 days, 5000, 20000);   // 365 days: 50% APY, 2.0x multiplier
    }
    
    function _addLockPeriod(uint256 duration, uint256 apyRate, uint256 multiplier) internal {
        lockPeriods[lockPeriodsCount] = LockPeriod(duration, apyRate, multiplier);
        emit LockPeriodAdded(lockPeriodsCount, duration, apyRate);
        lockPeriodsCount++;
    }
    
    /**
     * @dev Stake LIST tokens
     */
    function deposit(uint256 amount, uint256 lockPeriodId) external nonReentrant whenNotPaused {
        require(amount >= MIN_STAKE_AMOUNT, "Amount below minimum");
        require(lockPeriodId < lockPeriodsCount, "Invalid lock period");
        
        LockPeriod memory period = lockPeriods[lockPeriodId];
        uint256 stakeId = stakeCount[msg.sender];
        
        stakes[msg.sender][stakeId] = Stake({
            amount: amount,
            lockPeriodId: lockPeriodId,
            startTime: block.timestamp,
            unlockTime: block.timestamp + period.duration,
            lastRewardClaim: block.timestamp,
            totalRewardsClaimed: 0
        });
        
        stakeCount[msg.sender]++;
        totalStakedByUser[msg.sender] += amount;
        totalStaked += amount;
        
        listToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, stakeId, amount, lockPeriodId);
    }
    
    /**
     * @dev Withdraw staked tokens
     */
    function withdraw(uint256 stakeId) external nonReentrant {
        Stake storage stake = stakes[msg.sender][stakeId];
        require(stake.amount > 0, "No stake found");
        require(block.timestamp >= stake.unlockTime, "Stake still locked");
        
        // Claim any pending rewards first
        _claimRewards(msg.sender, stakeId);
        
        uint256 amount = stake.amount;
        totalStakedByUser[msg.sender] -= amount;
        totalStaked -= amount;
        
        delete stakes[msg.sender][stakeId];
        
        listToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, stakeId, amount);
    }
    
    /**
     * @dev Calculate pending rewards for a stake
     */
    function calculateRewards(address user, uint256 stakeId) public view returns (uint256) {
        Stake memory stake = stakes[user][stakeId];
        if (stake.amount == 0) return 0;
        
        LockPeriod memory period = lockPeriods[stake.lockPeriodId];
        
        uint256 timeStaked = block.timestamp - stake.lastRewardClaim;
        uint256 baseReward = (stake.amount * period.apyRate * timeStaked) / (10000 * SECONDS_PER_YEAR);
        
        // Apply multiplier
        uint256 rewardWithMultiplier = (baseReward * period.multiplier) / 10000;
        
        // Apply early staker bonus if applicable
        if (stake.startTime < earlyStakerDeadline && block.timestamp < earlyStakerDeadline) {
            uint256 bonus = (rewardWithMultiplier * earlyStakerBonusBps) / 10000;
            rewardWithMultiplier += bonus;
        }
        
        return rewardWithMultiplier;
    }
    
    /**
     * @dev Claim rewards
     */
    function claimRewards(uint256 stakeId) external nonReentrant {
        _claimRewards(msg.sender, stakeId);
    }
    
    function _claimRewards(address user, uint256 stakeId) internal {
        uint256 rewards = calculateRewards(user, stakeId);
        require(rewards > 0, "No rewards to claim");
        require(rewardPool >= rewards, "Insufficient reward pool");
        
        Stake storage stake = stakes[user][stakeId];
        stake.lastRewardClaim = block.timestamp;
        stake.totalRewardsClaimed += rewards;
        
        rewardPool -= rewards;
        totalRewardsDistributed += rewards;
        
        listToken.safeTransfer(user, rewards);
        
        emit RewardsClaimed(user, stakeId, rewards);
    }
    
    /**
     * @dev Compound rewards back into the stake
     */
    function compoundRewards(uint256 stakeId) external nonReentrant whenNotPaused {
        uint256 rewards = calculateRewards(msg.sender, stakeId);
        require(rewards > 0, "No rewards to compound");
        require(rewardPool >= rewards, "Insufficient reward pool");
        
        Stake storage stake = stakes[msg.sender][stakeId];
        stake.amount += rewards;
        stake.lastRewardClaim = block.timestamp;
        stake.totalRewardsClaimed += rewards;
        
        rewardPool -= rewards;
        totalStakedByUser[msg.sender] += rewards;
        totalStaked += rewards;
        
        emit RewardsCompounded(msg.sender, stakeId, rewards);
    }
    
    /**
     * @dev Fund the reward pool
     */
    function fundRewardPool(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        listToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(amount);
    }
    
    /**
     * @dev Get user's total staked amount across all stakes
     */
    function getUserTotalStaked(address user) external view returns (uint256) {
        return totalStakedByUser[user];
    }
    
    /**
     * @dev Get stake details
     */
    function getStake(address user, uint256 stakeId) external view returns (
        uint256 amount,
        uint256 lockPeriodId,
        uint256 startTime,
        uint256 unlockTime,
        uint256 pendingRewards
    ) {
        Stake memory stake = stakes[user][stakeId];
        return (
            stake.amount,
            stake.lockPeriodId,
            stake.startTime,
            stake.unlockTime,
            calculateRewards(user, stakeId)
        );
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(listToken), "Cannot withdraw staked tokens");
        IERC20(token).safeTransfer(owner(), amount);
    }
}

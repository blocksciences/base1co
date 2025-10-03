// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title FeeDistributor
 * @dev Manages platform fees: 50% burn, 50% to staking rewards
 * @notice Automatically distributes collected fees to burn and reward mechanisms
 */
contract FeeDistributor is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Interfaces
    IERC20 public immutable listToken;
    address public stakingVault;
    
    // Distribution ratios (basis points, 10000 = 100%)
    uint256 public burnRatio = 5000;      // 50%
    uint256 public rewardRatio = 5000;    // 50%
    uint256 public constant MAX_RATIO = 10000;
    
    // Statistics
    uint256 public totalFeesCollected;
    uint256 public totalBurned;
    uint256 public totalDistributedToRewards;
    uint256 public pendingDistribution;
    
    // Fee sources tracking
    mapping(address => bool) public authorizedFeeSources;
    mapping(address => uint256) public feesBySource;
    
    // Distribution thresholds
    uint256 public minDistributionAmount = 1000 * 10**18; // 1000 tokens minimum
    bool public autoDistribute = true;
    
    // Events
    event FeesCollected(address indexed source, uint256 amount);
    event FeesDistributed(uint256 burned, uint256 toRewards, uint256 timestamp);
    event BurnRatioUpdated(uint256 newRatio);
    event RewardRatioUpdated(uint256 newRatio);
    event FeeSourceAuthorized(address indexed source, bool status);
    event StakingVaultUpdated(address indexed newVault);
    event MinDistributionUpdated(uint256 newAmount);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _listToken Address of LIST token
     * @param _stakingVault Address of StakingVault
     * @param initialOwner Address of contract owner
     */
    constructor(
        address _listToken,
        address _stakingVault,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_listToken != address(0), "Invalid token address");
        require(_stakingVault != address(0), "Invalid vault address");
        
        listToken = IERC20(_listToken);
        stakingVault = _stakingVault;
    }
    
    /**
     * @dev Collect fees from authorized sources
     * @param amount Amount of fees to collect
     */
    function collectFees(uint256 amount) external nonReentrant whenNotPaused {
        require(authorizedFeeSources[msg.sender], "Not authorized fee source");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer fees to this contract
        listToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update statistics
        totalFeesCollected += amount;
        feesBySource[msg.sender] += amount;
        pendingDistribution += amount;
        
        emit FeesCollected(msg.sender, amount);
        
        // Auto-distribute if enabled and threshold met
        if (autoDistribute && pendingDistribution >= minDistributionAmount) {
            _distributeFees();
        }
    }
    
    /**
     * @dev Manually trigger fee distribution
     */
    function distributeFees() external nonReentrant {
        require(pendingDistribution > 0, "No fees to distribute");
        _distributeFees();
    }
    
    /**
     * @dev Internal function to distribute fees
     */
    function _distributeFees() internal {
        uint256 amount = pendingDistribution;
        require(amount > 0, "No fees to distribute");
        
        // Calculate distribution amounts
        uint256 burnAmount = (amount * burnRatio) / MAX_RATIO;
        uint256 rewardAmount = (amount * rewardRatio) / MAX_RATIO;
        
        // Ensure we don't exceed pending distribution due to rounding
        if (burnAmount + rewardAmount > amount) {
            rewardAmount = amount - burnAmount;
        }
        
        // Reset pending distribution
        pendingDistribution = 0;
        
        // Burn tokens
        if (burnAmount > 0) {
            IBurnableToken(address(listToken)).burn(burnAmount);
            totalBurned += burnAmount;
        }
        
        // Send to staking rewards
        if (rewardAmount > 0) {
            listToken.safeTransfer(stakingVault, rewardAmount);
            IStakingVault(stakingVault).fundRewardPool(rewardAmount);
            totalDistributedToRewards += rewardAmount;
        }
        
        emit FeesDistributed(burnAmount, rewardAmount, block.timestamp);
    }
    
    /**
     * @dev Set distribution ratios
     * @param _burnRatio New burn ratio (basis points)
     * @param _rewardRatio New reward ratio (basis points)
     */
    function setDistributionRatios(
        uint256 _burnRatio,
        uint256 _rewardRatio
    ) external onlyOwner {
        require(_burnRatio + _rewardRatio == MAX_RATIO, "Ratios must sum to 100%");
        require(_burnRatio <= MAX_RATIO && _rewardRatio <= MAX_RATIO, "Invalid ratios");
        
        burnRatio = _burnRatio;
        rewardRatio = _rewardRatio;
        
        emit BurnRatioUpdated(_burnRatio);
        emit RewardRatioUpdated(_rewardRatio);
    }
    
    /**
     * @dev Authorize or revoke fee source
     * @param source Address of fee source
     * @param status Authorization status
     */
    function setFeeSource(address source, bool status) external onlyOwner {
        require(source != address(0), "Invalid source address");
        authorizedFeeSources[source] = status;
        
        emit FeeSourceAuthorized(source, status);
    }
    
    /**
     * @dev Update staking vault address
     * @param _stakingVault New staking vault address
     */
    function setStakingVault(address _stakingVault) external onlyOwner {
        require(_stakingVault != address(0), "Invalid vault address");
        stakingVault = _stakingVault;
        
        emit StakingVaultUpdated(_stakingVault);
    }
    
    /**
     * @dev Set minimum distribution amount
     * @param amount New minimum amount
     */
    function setMinDistributionAmount(uint256 amount) external onlyOwner {
        require(amount >= 100 * 10**18, "Amount too low"); // Minimum 100 tokens
        minDistributionAmount = amount;
        
        emit MinDistributionUpdated(amount);
    }
    
    /**
     * @dev Toggle auto-distribution
     * @param enabled Whether auto-distribution is enabled
     */
    function setAutoDistribute(bool enabled) external onlyOwner {
        autoDistribute = enabled;
    }
    
    /**
     * @dev Get fee distribution preview
     * @return burnAmount Amount that will be burned
     * @return rewardAmount Amount that will go to rewards
     */
    function previewDistribution() external view returns (
        uint256 burnAmount,
        uint256 rewardAmount
    ) {
        uint256 amount = pendingDistribution;
        burnAmount = (amount * burnRatio) / MAX_RATIO;
        rewardAmount = (amount * rewardRatio) / MAX_RATIO;
        
        if (burnAmount + rewardAmount > amount) {
            rewardAmount = amount - burnAmount;
        }
    }
    
    /**
     * @dev Get distribution statistics
     * @return Statistics struct
     */
    function getStatistics() external view returns (
        uint256 _totalFeesCollected,
        uint256 _totalBurned,
        uint256 _totalDistributedToRewards,
        uint256 _pendingDistribution,
        uint256 _burnPercentage,
        uint256 _rewardPercentage
    ) {
        _totalFeesCollected = totalFeesCollected;
        _totalBurned = totalBurned;
        _totalDistributedToRewards = totalDistributedToRewards;
        _pendingDistribution = pendingDistribution;
        _burnPercentage = burnRatio;
        _rewardPercentage = rewardRatio;
    }
    
    /**
     * @dev Get fees collected by specific source
     * @param source Address of fee source
     * @return Amount of fees collected by source
     */
    function getFeesBySource(address source) external view returns (uint256) {
        return feesBySource[source];
    }
    
    /**
     * @dev Check if distribution is ready
     * @return Whether distribution threshold is met
     */
    function isDistributionReady() external view returns (bool) {
        return pendingDistribution >= minDistributionAmount;
    }
    
    /**
     * @dev Emergency withdraw (owner only, use with caution)
     * @param token Address of token to withdraw (address(0) for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        
        if (token == address(0)) {
            // Withdraw ETH
            (bool success, ) = payable(owner()).call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            // Withdraw ERC20
            IERC20(token).safeTransfer(owner(), amount);
        }
        
        emit EmergencyWithdraw(token, amount);
    }
    
    /**
     * @dev Pause fee collection (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause fee collection
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {
        // Accept ETH for emergency purposes
    }
}

interface IBurnableToken {
    function burn(uint256 amount) external;
}

interface IStakingVault {
    function fundRewardPool(uint256 amount) external;
}
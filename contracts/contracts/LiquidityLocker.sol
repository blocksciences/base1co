// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LiquidityLocker
 * @dev Lock LP tokens until a specified unlock time
 * @notice Provides transparency and trust for liquidity provisions
 */
contract LiquidityLocker is Ownable, ReentrancyGuard {
    struct Lock {
        address token;           // LP token address
        address beneficiary;     // Who can withdraw after unlock
        uint256 amount;          // Amount of tokens locked
        uint256 unlockTime;      // Timestamp when tokens can be withdrawn
        bool withdrawn;          // Has the lock been withdrawn
        string description;      // Optional description (e.g., "Uniswap V3 WETH/TOKEN")
    }
    
    // lockId => Lock
    mapping(uint256 => Lock) public locks;
    
    // Track locks per beneficiary
    mapping(address => uint256[]) public beneficiaryLocks;
    
    // Track locks per token
    mapping(address => uint256[]) public tokenLocks;
    
    uint256 public nextLockId;
    
    event TokensLocked(
        uint256 indexed lockId,
        address indexed token,
        address indexed beneficiary,
        uint256 amount,
        uint256 unlockTime,
        string description
    );
    event TokensWithdrawn(uint256 indexed lockId, address indexed beneficiary, uint256 amount);
    event UnlockTimeExtended(uint256 indexed lockId, uint256 newUnlockTime);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Lock LP tokens until a specified time
     * @param token LP token address to lock
     * @param beneficiary Address that can withdraw after unlock
     * @param amount Amount of tokens to lock
     * @param unlockTime Timestamp when tokens can be withdrawn
     * @param description Optional description of the lock
     * @return lockId ID of the created lock
     */
    function lockTokens(
        address token,
        address beneficiary,
        uint256 amount,
        uint256 unlockTime,
        string calldata description
    ) external nonReentrant returns (uint256 lockId) {
        require(token != address(0), "Invalid token");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(unlockTime > block.timestamp, "Unlock time must be future");
        
        lockId = nextLockId++;
        
        locks[lockId] = Lock({
            token: token,
            beneficiary: beneficiary,
            amount: amount,
            unlockTime: unlockTime,
            withdrawn: false,
            description: description
        });
        
        beneficiaryLocks[beneficiary].push(lockId);
        tokenLocks[token].push(lockId);
        
        // Transfer tokens to locker
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        emit TokensLocked(lockId, token, beneficiary, amount, unlockTime, description);
    }
    
    /**
     * @notice Withdraw tokens from a lock after unlock time
     * @param lockId ID of the lock to withdraw from
     */
    function withdraw(uint256 lockId) external nonReentrant {
        Lock storage lock = locks[lockId];
        
        require(lock.amount > 0, "Lock does not exist");
        require(!lock.withdrawn, "Already withdrawn");
        require(msg.sender == lock.beneficiary, "Not beneficiary");
        require(block.timestamp >= lock.unlockTime, "Still locked");
        
        lock.withdrawn = true;
        
        require(
            IERC20(lock.token).transfer(lock.beneficiary, lock.amount),
            "Transfer failed"
        );
        
        emit TokensWithdrawn(lockId, lock.beneficiary, lock.amount);
    }
    
    /**
     * @notice Extend unlock time (can only make it longer)
     * @param lockId ID of the lock to extend
     * @param newUnlockTime New unlock timestamp (must be later than current)
     */
    function extendLock(uint256 lockId, uint256 newUnlockTime) external {
        Lock storage lock = locks[lockId];
        
        require(lock.amount > 0, "Lock does not exist");
        require(!lock.withdrawn, "Already withdrawn");
        require(msg.sender == lock.beneficiary || msg.sender == owner(), "Not authorized");
        require(newUnlockTime > lock.unlockTime, "Can only extend");
        
        lock.unlockTime = newUnlockTime;
        
        emit UnlockTimeExtended(lockId, newUnlockTime);
    }
    
    /**
     * @notice Get all lock IDs for a beneficiary
     * @param beneficiary Address to query
     * @return Array of lock IDs
     */
    function getLocksByBeneficiary(address beneficiary) external view returns (uint256[] memory) {
        return beneficiaryLocks[beneficiary];
    }
    
    /**
     * @notice Get all lock IDs for a token
     * @param token Token address to query
     * @return Array of lock IDs
     */
    function getLocksByToken(address token) external view returns (uint256[] memory) {
        return tokenLocks[token];
    }
    
    /**
     * @notice Get lock details
     * @param lockId Lock ID to query
     * @return lock Lock details
     */
    function getLock(uint256 lockId) external view returns (Lock memory) {
        return locks[lockId];
    }
    
    /**
     * @notice Check if a lock is withdrawable
     * @param lockId Lock ID to check
     * @return bool Whether the lock can be withdrawn
     */
    function isWithdrawable(uint256 lockId) external view returns (bool) {
        Lock memory lock = locks[lockId];
        return !lock.withdrawn && block.timestamp >= lock.unlockTime;
    }
}
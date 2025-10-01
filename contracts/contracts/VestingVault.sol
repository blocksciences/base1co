// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VestingVault
 * @dev Token vesting contract with cliff and linear release
 * @notice Supports multiple beneficiaries with individual vesting schedules
 */
contract VestingVault is Ownable, ReentrancyGuard {
    struct VestingSchedule {
        uint256 totalAmount;        // Total tokens to vest
        uint256 startTime;          // Vesting start timestamp
        uint256 cliffDuration;      // Cliff period in seconds
        uint256 vestingDuration;    // Total vesting duration in seconds
        uint256 releasedAmount;     // Amount already released
        bool revocable;             // Can this schedule be revoked
        bool revoked;               // Has this schedule been revoked
    }
    
    IERC20 public token;
    
    // beneficiary => vesting schedule
    mapping(address => VestingSchedule) public vestingSchedules;
    
    // Track all beneficiaries
    address[] public beneficiaries;
    mapping(address => bool) public isBeneficiary;
    
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 refundAmount);
    
    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token address");
        token = IERC20(tokenAddress);
    }
    
    /**
     * @notice Create a vesting schedule for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @param totalAmount Total tokens to vest
     * @param startTime Vesting start timestamp
     * @param cliffDuration Cliff period in seconds
     * @param vestingDuration Total vesting duration in seconds
     * @param revocable Whether the schedule can be revoked
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(totalAmount > 0, "Amount must be > 0");
        require(vestingDuration > 0, "Duration must be > 0");
        require(cliffDuration <= vestingDuration, "Cliff > duration");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule exists");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: totalAmount,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            releasedAmount: 0,
            revocable: revocable,
            revoked: false
        });
        
        if (!isBeneficiary[beneficiary]) {
            beneficiaries.push(beneficiary);
            isBeneficiary[beneficiary] = true;
        }
        
        // Transfer tokens to vault
        require(
            token.transferFrom(msg.sender, address(this), totalAmount),
            "Transfer failed"
        );
        
        emit VestingScheduleCreated(
            beneficiary,
            totalAmount,
            startTime,
            cliffDuration,
            vestingDuration,
            revocable
        );
    }
    
    /**
     * @notice Calculate vested amount for a beneficiary
     * @param beneficiary Address to check
     * @return Vested amount
     */
    function vestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        if (schedule.revoked || schedule.totalAmount == 0) {
            return 0;
        }
        
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount;
        }
        
        uint256 timeVested = block.timestamp - schedule.startTime;
        return (schedule.totalAmount * timeVested) / schedule.vestingDuration;
    }
    
    /**
     * @notice Calculate releasable amount for a beneficiary
     * @param beneficiary Address to check
     * @return Releasable amount
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        uint256 vested = vestedAmount(beneficiary);
        return vested - vestingSchedules[beneficiary].releasedAmount;
    }
    
    /**
     * @notice Release vested tokens to beneficiary
     */
    function release() external nonReentrant {
        uint256 amount = releasableAmount(msg.sender);
        require(amount > 0, "No tokens to release");
        
        vestingSchedules[msg.sender].releasedAmount += amount;
        
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        emit TokensReleased(msg.sender, amount);
    }
    
    /**
     * @notice Revoke a vesting schedule and refund unvested tokens
     * @param beneficiary Address of beneficiary to revoke
     */
    function revoke(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");
        
        uint256 vested = vestedAmount(beneficiary);
        uint256 refund = schedule.totalAmount - vested;
        
        schedule.revoked = true;
        
        if (refund > 0) {
            require(token.transfer(owner(), refund), "Refund failed");
        }
        
        emit VestingRevoked(beneficiary, refund);
    }
    
    /**
     * @notice Get all beneficiaries
     * @return Array of beneficiary addresses
     */
    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaries;
    }
    
    /**
     * @notice Get vesting schedule for a beneficiary
     * @param beneficiary Address to check
     * @return schedule Vesting schedule details
     */
    function getVestingSchedule(address beneficiary) external view returns (VestingSchedule memory) {
        return vestingSchedules[beneficiary];
    }
}
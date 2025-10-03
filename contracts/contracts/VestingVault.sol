// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VestingVault is Ownable, ReentrancyGuard {
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        uint256 releasedAmount;
        address funder;
        bool revocable;
        bool revoked;
    }
    
    IERC20 public token;
    
    mapping(address => VestingSchedule) public vestingSchedules;
    
    address[] public beneficiaries;
    mapping(address => bool) public isBeneficiary;
    
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable,
        address indexed funder
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, address indexed funder, uint256 refundAmount);
    event BeneficiaryUpdated(address indexed oldBeneficiary, address indexed newBeneficiary);
    
    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token address");
        token = IERC20(tokenAddress);
    }
    
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
        require(startTime >= block.timestamp, "Start time must be in future");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: totalAmount,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            releasedAmount: 0,
            funder: msg.sender,
            revocable: revocable,
            revoked: false
        });
        
        if (!isBeneficiary[beneficiary]) {
            beneficiaries.push(beneficiary);
            isBeneficiary[beneficiary] = true;
        }
        
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
            revocable,
            msg.sender
        );
    }
    
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
    
    function releasableAmount(address beneficiary) public view returns (uint256) {
        uint256 vested = vestedAmount(beneficiary);
        return vested - vestingSchedules[beneficiary].releasedAmount;
    }
    
    function release() external nonReentrant {
        uint256 amount = releasableAmount(msg.sender);
        require(amount > 0, "No tokens to release");
        
        vestingSchedules[msg.sender].releasedAmount += amount;
        
        require(token.transfer(msg.sender, amount), "Transfer failed");
        
        emit TokensReleased(msg.sender, amount);
    }
    
    function revoke(address beneficiary) external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");
        require(msg.sender == owner() || msg.sender == schedule.funder, "Not authorized");
        
        uint256 vested = vestedAmount(beneficiary);
        uint256 refund = schedule.totalAmount - vested;
        
        schedule.revoked = true;
        
        if (refund > 0) {
            require(token.transfer(schedule.funder, refund), "Refund failed");
        }
        
        emit VestingRevoked(beneficiary, schedule.funder, refund);
    }
    
    function updateBeneficiary(address oldBeneficiary, address newBeneficiary) external onlyOwner {
        require(oldBeneficiary != address(0), "Invalid old beneficiary");
        require(newBeneficiary != address(0), "Invalid new beneficiary");
        require(vestingSchedules[oldBeneficiary].totalAmount > 0, "No schedule for old beneficiary");
        require(vestingSchedules[newBeneficiary].totalAmount == 0, "New beneficiary already has schedule");
        require(!vestingSchedules[oldBeneficiary].revoked, "Schedule already revoked");
        
        vestingSchedules[newBeneficiary] = vestingSchedules[oldBeneficiary];
        delete vestingSchedules[oldBeneficiary];
        
        isBeneficiary[oldBeneficiary] = false;
        if (!isBeneficiary[newBeneficiary]) {
            beneficiaries.push(newBeneficiary);
            isBeneficiary[newBeneficiary] = true;
        }
        
        emit BeneficiaryUpdated(oldBeneficiary, newBeneficiary);
    }
    
    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaries;
    }
    
    function getVestingSchedule(address beneficiary) external view returns (VestingSchedule memory) {
        return vestingSchedules[beneficiary];
    }
    
    function getRemainingTime(address beneficiary) external view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        if (schedule.totalAmount == 0 || schedule.revoked) {
            return 0;
        }
        
        uint256 endTime = schedule.startTime + schedule.vestingDuration;
        if (block.timestamp >= endTime) {
            return 0;
        }
        
        return endTime - block.timestamp;
    }
}

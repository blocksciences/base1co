// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LISTToken
 * @dev Platform token for the ICO Launchpad with 10B total supply
 */
contract LISTToken is ERC20, Ownable, Pausable {
    uint8 private constant _decimals = 18;
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 10 Billion tokens
    
    // Allocation addresses
    address public stakingRewardsAddress;
    address public teamAddress;
    address public liquidityAddress;
    address public ecosystemAddress;
    
    // Allocation amounts (percentages of total supply)
    uint256 public constant STAKING_REWARDS_ALLOCATION = 3_000_000_000 * 10**18; // 30%
    uint256 public constant ICO_PARTICIPANTS_ALLOCATION = 2_500_000_000 * 10**18; // 25%
    uint256 public constant TEAM_ALLOCATION = 2_000_000_000 * 10**18; // 20%
    uint256 public constant LIQUIDITY_ALLOCATION = 1_500_000_000 * 10**18; // 15%
    uint256 public constant ECOSYSTEM_ALLOCATION = 1_000_000_000 * 10**18; // 10%
    
    constructor(
        address _stakingRewards,
        address _team,
        address _liquidity,
        address _ecosystem
    ) ERC20("List Token", "LIST") Ownable(msg.sender) {
        require(_stakingRewards != address(0), "Invalid staking address");
        require(_team != address(0), "Invalid team address");
        require(_liquidity != address(0), "Invalid liquidity address");
        require(_ecosystem != address(0), "Invalid ecosystem address");
        
        stakingRewardsAddress = _stakingRewards;
        teamAddress = _team;
        liquidityAddress = _liquidity;
        ecosystemAddress = _ecosystem;
        
        // Mint allocations
        _mint(_stakingRewards, STAKING_REWARDS_ALLOCATION);
        _mint(_team, TEAM_ALLOCATION);
        _mint(_liquidity, LIQUIDITY_ALLOCATION);
        _mint(_ecosystem, ECOSYSTEM_ALLOCATION);
        _mint(msg.sender, ICO_PARTICIPANTS_ALLOCATION); // Owner controls ICO allocation
    }
    
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}

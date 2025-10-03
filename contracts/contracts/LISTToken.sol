// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LISTToken
 * @dev Platform token with 10B total supply, burnable, and permit functionality
 * @notice This is the core utility token for the LIST platform ecosystem
 */
contract LISTToken is ERC20, ERC20Burnable, ERC20Permit, Ownable, Pausable {
    
    // Constants
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 10 billion tokens
    uint256 public constant MAX_SUPPLY = TOTAL_SUPPLY; // Hard cap
    
    // Authorized contracts that can interact with token mechanics
    mapping(address => bool) public authorizedContracts;
    
    // Anti-whale mechanism
    uint256 public maxTransferAmount;
    bool public antiWhaleEnabled;
    mapping(address => bool) public isExemptFromMaxTransfer;
    
    // Events
    event ContractAuthorized(address indexed contractAddress, bool status);
    event AntiWhaleUpdated(bool enabled, uint256 maxAmount);
    event ExemptionUpdated(address indexed account, bool isExempt);
    
    /**
     * @dev Constructor mints total supply to deployer
     * @param initialOwner Address that will receive initial supply and ownership
     */
    constructor(address initialOwner) 
        ERC20("LIST Token", "LIST") 
        ERC20Permit("LIST Token")
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), "Invalid owner address");
        
        // Mint total supply to initial owner
        _mint(initialOwner, TOTAL_SUPPLY);
        
        // Set initial anti-whale parameters (5% of supply)
        maxTransferAmount = TOTAL_SUPPLY / 20;
        antiWhaleEnabled = false;
        
        // Exempt owner from max transfer
        isExemptFromMaxTransfer[initialOwner] = true;
        
        emit AntiWhaleUpdated(antiWhaleEnabled, maxTransferAmount);
    }
    
    /**
     * @dev Authorize contract to interact with token mechanics
     * @param contractAddress Address of contract to authorize
     * @param status Authorization status
     */
    function setAuthorizedContract(address contractAddress, bool status) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        authorizedContracts[contractAddress] = status;
        
        // Exempt authorized contracts from max transfer
        isExemptFromMaxTransfer[contractAddress] = status;
        
        emit ContractAuthorized(contractAddress, status);
        emit ExemptionUpdated(contractAddress, status);
    }
    
    /**
     * @dev Configure anti-whale mechanism
     * @param enabled Whether anti-whale is active
     * @param maxAmount Maximum transfer amount (in tokens with decimals)
     */
    function setAntiWhale(bool enabled, uint256 maxAmount) external onlyOwner {
        require(maxAmount >= TOTAL_SUPPLY / 1000, "Max amount too low"); // Minimum 0.1%
        require(maxAmount <= TOTAL_SUPPLY / 10, "Max amount too high"); // Maximum 10%
        
        antiWhaleEnabled = enabled;
        maxTransferAmount = maxAmount;
        
        emit AntiWhaleUpdated(enabled, maxAmount);
    }
    
    /**
     * @dev Set exemption status for address
     * @param account Address to update
     * @param isExempt Exemption status
     */
    function setExemption(address account, bool isExempt) external onlyOwner {
        require(account != address(0), "Invalid address");
        isExemptFromMaxTransfer[account] = isExempt;
        
        emit ExemptionUpdated(account, isExempt);
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to add anti-whale and pause checks
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        // Check anti-whale limits (exclude minting and burning)
        if (
            antiWhaleEnabled && 
            from != address(0) && 
            to != address(0) &&
            !isExemptFromMaxTransfer[from] && 
            !isExemptFromMaxTransfer[to]
        ) {
            require(amount <= maxTransferAmount, "Transfer amount exceeds maximum");
        }
        
        super._update(from, to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount to burn
     */
    function burn(uint256 amount) public virtual override {
        super.burn(amount);
    }
    
    /**
     * @dev Burn tokens from specified account (requires allowance)
     * @param account Account to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address account, uint256 amount) public virtual override {
        super.burnFrom(account, amount);
    }
    
    /**
     * @dev Get current circulating supply (total - burned)
     * @return Current circulating supply
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    /**
     * @dev Get total burned tokens
     * @return Amount of burned tokens
     */
    function totalBurned() external view returns (uint256) {
        return TOTAL_SUPPLY - totalSupply();
    }
    
    /**
     * @dev Recover accidentally sent ERC20 tokens
     * @param tokenAddress Address of token to recover
     * @param amount Amount to recover
     */
    function recoverERC20(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(this), "Cannot recover LIST tokens");
        require(tokenAddress != address(0), "Invalid token address");
        
        IERC20(tokenAddress).transfer(owner(), amount);
    }
    
    /**
     * @dev Check if address is authorized contract
     * @param account Address to check
     * @return Whether address is authorized
     */
    function isAuthorizedContract(address account) external view returns (bool) {
        return authorizedContracts[account];
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICOToken.sol";
import "./ICOSale.sol";
import "./KYCRegistry.sol";
import "./VestingVault.sol";
import "./LiquidityLocker.sol";

/**
 * @title ICOLaunchpad
 * @dev Registry contract for tracking deployed ICO sales
 * @notice Central registry for all deployed token sales
 */
contract ICOLaunchpad is Ownable {
    struct DeployedSale {
        address saleContract;
        address tokenContract;
        address kycRegistry;
        address vestingVault;
        address liquidityLocker;
        address creator;
        uint256 deployedAt;
        bool active;
    }
    
    // Sale ID => DeployedSale
    mapping(uint256 => DeployedSale) public sales;
    
    // Track all sale IDs
    uint256[] public allSaleIds;
    
    // Track sales by creator
    mapping(address => uint256[]) public salesByCreator;
    
    uint256 public nextSaleId;
    uint256 public platformFeePercent = 2; // 2% platform fee
    
    event SaleDeployed(
        uint256 indexed saleId,
        address indexed creator,
        address saleContract,
        address tokenContract,
        address kycRegistry,
        uint256 timestamp
    );
    
    event SaleStatusUpdated(uint256 indexed saleId, bool active);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Deploy a complete ICO sale with all contracts
     * @param tokenName Name of the token
     * @param tokenSymbol Symbol of the token
     * @param initialSupply Initial token supply
     * @param tokenDecimals Token decimals
     * @param tokenPrice Price per token in wei
     * @param softCap Soft cap in wei
     * @param hardCap Hard cap in wei
     * @param minContribution Minimum contribution in wei
     * @param maxContribution Maximum contribution in wei
     * @param maxPerWallet Maximum per wallet in wei
     * @param startTime Sale start timestamp
     * @param endTime Sale end timestamp
     * @return saleId ID of the deployed sale
     */
    function deploySale(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        uint8 tokenDecimals,
        uint256 tokenPrice,
        uint256 softCap,
        uint256 hardCap,
        uint256 minContribution,
        uint256 maxContribution,
        uint256 maxPerWallet,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256 saleId) {
        require(bytes(tokenName).length > 0, "Token name required");
        require(bytes(tokenSymbol).length > 0, "Token symbol required");
        require(initialSupply > 0, "Supply must be positive");
        require(startTime < endTime, "Invalid time range");
        require(startTime > block.timestamp, "Start time must be in future");
        require(hardCap > softCap, "Hard cap must exceed soft cap");
        require(maxContribution >= minContribution, "Max must be >= min");
        
        // Deploy KYC Registry
        KYCRegistry kycRegistry = new KYCRegistry();
        
        // Deploy Token
        ICOToken token = new ICOToken(tokenName, tokenSymbol, initialSupply, tokenDecimals);
        
        // Deploy Sale Contract
        ICOSale sale = new ICOSale(
            address(token),
            address(kycRegistry),
            tokenPrice,
            softCap,
            hardCap,
            minContribution,
            maxContribution,
            maxPerWallet,
            startTime,
            endTime
        );
        
        // Deploy Vesting Vault
        VestingVault vestingVault = new VestingVault(address(token));
        
        // Deploy Liquidity Locker
        LiquidityLocker liquidityLocker = new LiquidityLocker();
        
        // Calculate token allocation (40% to sale, rest stays with deployer)
        uint256 totalSupplyWithDecimals = initialSupply * (10 ** tokenDecimals);
        uint256 saleAllocation = (totalSupplyWithDecimals * 40) / 100;
        
        // Transfer tokens to sale contract (tokens were minted to this launchpad contract)
        require(token.transfer(address(sale), saleAllocation), "Token transfer failed");
        
        // Transfer remaining tokens to the creator
        uint256 remaining = token.balanceOf(address(this));
        if (remaining > 0) {
            require(token.transfer(msg.sender, remaining), "Remaining token transfer failed");
        }
        
        // Register the sale
        saleId = this.registerSale(
            address(sale),
            address(token),
            address(kycRegistry),
            address(vestingVault),
            address(liquidityLocker),
            msg.sender
        );
        
        return saleId;
    }
    
    /**
     * @notice Register a deployed ICO sale
     * @param saleContract Address of the ICO sale contract
     * @param tokenContract Address of the token contract
     * @param kycRegistry Address of the KYC registry
     * @param vestingVault Address of the vesting vault
     * @param liquidityLocker Address of the liquidity locker
     * @param creator Address of the sale creator
     * @return saleId ID of the registered sale
     */
    function registerSale(
        address saleContract,
        address tokenContract,
        address kycRegistry,
        address vestingVault,
        address liquidityLocker,
        address creator
    ) external onlyOwner returns (uint256 saleId) {
        require(saleContract != address(0), "Invalid sale address");
        require(tokenContract != address(0), "Invalid token address");
        require(kycRegistry != address(0), "Invalid KYC address");
        
        saleId = nextSaleId++;
        
        sales[saleId] = DeployedSale({
            saleContract: saleContract,
            tokenContract: tokenContract,
            kycRegistry: kycRegistry,
            vestingVault: vestingVault,
            liquidityLocker: liquidityLocker,
            creator: creator,
            deployedAt: block.timestamp,
            active: true
        });
        
        allSaleIds.push(saleId);
        salesByCreator[creator].push(saleId);
        
        emit SaleDeployed(
            saleId,
            creator,
            saleContract,
            tokenContract,
            kycRegistry,
            block.timestamp
        );
        
        return saleId;
    }
    
    /**
     * @notice Update sale active status
     * @param saleId Sale ID to update
     * @param active New active status
     */
    function updateSaleStatus(uint256 saleId, bool active) external onlyOwner {
        require(saleId < nextSaleId, "Sale does not exist");
        sales[saleId].active = active;
        emit SaleStatusUpdated(saleId, active);
    }
    
    /**
     * @notice Update platform fee percentage
     * @param newFeePercent New fee percentage (0-100)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 10, "Fee too high"); // Max 10%
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }
    
    /**
     * @notice Get all sale IDs
     * @return Array of all sale IDs
     */
    function getAllSales() external view returns (uint256[] memory) {
        return allSaleIds;
    }
    
    /**
     * @notice Get sales by creator
     * @param creator Creator address
     * @return Array of sale IDs
     */
    function getSalesByCreator(address creator) external view returns (uint256[] memory) {
        return salesByCreator[creator];
    }
    
    /**
     * @notice Get sale details
     * @param saleId Sale ID
     * @return sale Sale details
     */
    function getSale(uint256 saleId) external view returns (DeployedSale memory) {
        require(saleId < nextSaleId, "Sale does not exist");
        return sales[saleId];
    }
    
    /**
     * @notice Get active sales count
     * @return count Number of active sales
     */
    function getActiveSalesCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < allSaleIds.length; i++) {
            if (sales[allSaleIds[i]].active) {
                count++;
            }
        }
        return count;
    }
}
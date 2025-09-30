// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICOSale.sol";
import "./ICOToken.sol";
import "./KYCRegistry.sol";
import "./VestingVault.sol";
import "./LiquidityLocker.sol";

/**
 * @title ICOLaunchpad
 * @dev Factory contract for deploying and managing ICO sales
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
     * @notice Deploy a complete ICO sale with all components
     * @param tokenName Token name
     * @param tokenSymbol Token symbol
     * @param tokenSupply Total token supply
     * @param tokenDecimals Token decimals
     * @param tokenPrice Price in wei per token
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
        uint256 tokenSupply,
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
        require(startTime > block.timestamp, "Start must be in future");
        require(endTime > startTime, "End must be after start");
        require(hardCap > softCap, "Hard cap must be > soft cap");
        
        saleId = nextSaleId++;
        
        // Deploy KYC Registry
        KYCRegistry kycRegistry = new KYCRegistry();
        kycRegistry.transferOwnership(msg.sender);
        
        // Deploy Token
        ICOToken token = new ICOToken(
            tokenName,
            tokenSymbol,
            tokenSupply,
            tokenDecimals
        );
        
        // Deploy ICO Sale
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
        vestingVault.transferOwnership(msg.sender);
        
        // Deploy Liquidity Locker
        LiquidityLocker liquidityLocker = new LiquidityLocker();
        liquidityLocker.transferOwnership(msg.sender);
        
        // Transfer token ownership to creator for initial setup
        token.transferOwnership(msg.sender);
        
        // Transfer sale ownership to creator
        sale.transferOwnership(msg.sender);
        
        // Store sale information
        sales[saleId] = DeployedSale({
            saleContract: address(sale),
            tokenContract: address(token),
            kycRegistry: address(kycRegistry),
            vestingVault: address(vestingVault),
            liquidityLocker: address(liquidityLocker),
            creator: msg.sender,
            deployedAt: block.timestamp,
            active: true
        });
        
        allSaleIds.push(saleId);
        salesByCreator[msg.sender].push(saleId);
        
        emit SaleDeployed(
            saleId,
            msg.sender,
            address(sale),
            address(token),
            address(kycRegistry),
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
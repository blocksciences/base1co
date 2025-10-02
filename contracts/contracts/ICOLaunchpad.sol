// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

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
    
    // Track authorized deployers
    mapping(address => bool) public authorizedDeployers;
    
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
    event DeployerAuthorized(address indexed deployer);
    event DeployerRevoked(address indexed deployer);
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || authorizedDeployers[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Authorize an address to register sales
     * @param deployer Address to authorize
     */
    function authorizeDeployer(address deployer) external onlyOwner {
        require(deployer != address(0), "Invalid deployer address");
        authorizedDeployers[deployer] = true;
        emit DeployerAuthorized(deployer);
    }
    
    /**
     * @notice Revoke deployer authorization
     * @param deployer Address to revoke
     */
    function revokeDeployer(address deployer) external onlyOwner {
        authorizedDeployers[deployer] = false;
        emit DeployerRevoked(deployer);
    }
    
    /**
     * @notice Check if an address is authorized
     * @param deployer Address to check
     * @return bool True if authorized
     */
    function isAuthorizedDeployer(address deployer) external view returns (bool) {
        return authorizedDeployers[deployer];
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
    ) external onlyAuthorized returns (uint256 saleId) {
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
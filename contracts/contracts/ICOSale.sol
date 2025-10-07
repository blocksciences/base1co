// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IKYCRegistry {
    function isEligible(address user) external view returns (bool);
}

/**
 * @title ICOSale
 * @dev ICO contract for token sales with configurable parameters and KYC integration
 */
contract ICOSale is Ownable, ReentrancyGuard, Pausable {
    IERC20Metadata public token; // Changed to IERC20Metadata to access decimals()
    IKYCRegistry public kycRegistry;
    
    uint256 public tokenPrice; // Price in wei per token (considering decimals)
    uint256 public softCap;
    uint256 public hardCap;
    uint256 public minContribution;
    uint256 public maxContribution;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public fundsRaised;
    
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public tokensPurchased;
    mapping(address => uint256) public tokensClaimed;
    address[] public contributors;
    
    bool public finalized;
    bool public softCapReached;
    bool public emergencyMode;
    
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensClaimed(address indexed buyer, uint256 tokenAmount);
    event Refund(address indexed buyer, uint256 ethAmount);
    event SaleFinalized(uint256 totalRaised);
    event EmergencyWithdraw(address indexed owner, uint256 amount);
    
    constructor(
        address _token,
        address _kycRegistry,
        uint256 _tokenPrice,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _maxPerWallet, // REMOVED: No longer used, kept for compatibility
        uint256 _startTime,
        uint256 _endTime
    ) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_kycRegistry != address(0), "Invalid KYC registry");
        require(_softCap < _hardCap, "Soft cap must be less than hard cap");
        require(_startTime < _endTime, "Start time must be before end time");
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_tokenPrice > 0, "Token price must be > 0");
        require(_minContribution > 0, "Min contribution must be > 0");
        require(_maxContribution >= _minContribution, "Max must be >= min");
        
        token = IERC20Metadata(_token);
        kycRegistry = IKYCRegistry(_kycRegistry);
        tokenPrice = _tokenPrice;
        softCap = _softCap;
        hardCap = _hardCap;
        minContribution = _minContribution;
        maxContribution = _maxContribution;
        startTime = _startTime;
        endTime = _endTime;
    }
    
    modifier saleActive() {
        require(block.timestamp >= startTime, "Sale not started");
        require(block.timestamp <= endTime, "Sale ended");
        require(!finalized, "Sale finalized");
        require(!emergencyMode, "Emergency mode active");
        require(fundsRaised < hardCap, "Hard cap reached");
        _;
    }
    
    function buyTokens() external payable nonReentrant whenNotPaused saleActive {
        require(kycRegistry.isEligible(msg.sender), "Not KYC approved");
        require(msg.value >= minContribution, "Below minimum contribution");
        require(contributions[msg.sender] + msg.value <= maxContribution, "Exceeds maximum contribution");
        
        uint256 availableForSale = hardCap - fundsRaised;
        uint256 contribution = msg.value > availableForSale ? availableForSale : msg.value;
        uint256 refund = msg.value - contribution;
        
        // FIXED: Use actual token decimals instead of hardcoded 18
        uint256 tokenDecimals = token.decimals();
        uint256 tokenAmount = (contribution * (10 ** tokenDecimals)) / tokenPrice;
        
        // ADDED: Check if contract has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in sale");
        
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        
        contributions[msg.sender] += contribution;
        tokensPurchased[msg.sender] += tokenAmount;
        fundsRaised += contribution;
        
        if (fundsRaised >= softCap && !softCapReached) {
            softCapReached = true;
        }
        
        // DO NOT transfer tokens immediately - they will be claimed after sale succeeds
        emit TokensPurchased(msg.sender, contribution, tokenAmount);
        
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
    }
    
    function claimTokens() external nonReentrant {
        require(finalized, "Sale not finalized");
        require(softCapReached, "Soft cap not reached");
        
        uint256 tokenAmount = tokensPurchased[msg.sender] - tokensClaimed[msg.sender];
        require(tokenAmount > 0, "No tokens to claim");
        
        tokensClaimed[msg.sender] += tokenAmount;
        
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        emit TokensClaimed(msg.sender, tokenAmount);
    }
    
    function claimRefund() external nonReentrant {
        require(block.timestamp > endTime || emergencyMode, "Sale not ended");
        require(!softCapReached || emergencyMode, "Soft cap reached, no refunds");
        require(contributions[msg.sender] > 0, "No contribution found");
        
        uint256 refundAmount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        payable(msg.sender).transfer(refundAmount);
        
        emit Refund(msg.sender, refundAmount);
    }
    
    function finalizeSale() external onlyOwner {
        require(block.timestamp > endTime || fundsRaised >= hardCap, "Sale not ended");
        require(!finalized, "Already finalized");
        require(softCapReached, "Soft cap not reached");
        
        finalized = true;
        
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(owner()).transfer(balance);
        }
        
        emit SaleFinalized(fundsRaised);
    }
    
    function withdrawUnsoldTokens() external onlyOwner {
        require(finalized, "Sale not finalized");
        
        uint256 unsoldTokens = token.balanceOf(address(this));
        if (unsoldTokens > 0) {
            require(token.transfer(owner(), unsoldTokens), "Token transfer failed");
        }
    }
    
    // NEW: Emergency functions
    function enableEmergencyMode() external onlyOwner {
        emergencyMode = true;
    }
    
    function emergencyWithdrawETH() external onlyOwner {
        require(emergencyMode, "Not in emergency mode");
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit EmergencyWithdraw(owner(), balance);
    }
    
    function emergencyWithdrawTokens() external onlyOwner {
        require(emergencyMode, "Not in emergency mode");
        uint256 tokenBalance = token.balanceOf(address(this));
        if (tokenBalance > 0) {
            token.transfer(owner(), tokenBalance);
        }
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function extendSale(uint256 newEndTime) external onlyOwner {
        require(newEndTime > endTime, "New end time must be after current end time");
        require(!finalized, "Sale already finalized");
        endTime = newEndTime;
    }
    
    function getContributorCount() external view returns (uint256) {
        return contributors.length;
    }
    
    function getUserTokenInfo(address user) external view returns (
        uint256 purchased,
        uint256 claimed,
        uint256 claimable
    ) {
        purchased = tokensPurchased[user];
        claimed = tokensClaimed[user];
        claimable = (finalized && softCapReached) ? (purchased - claimed) : 0;
        return (purchased, claimed, claimable);
    }
    
    function getSaleInfo() external view returns (
        uint256 _fundsRaised,
        uint256 _hardCap,
        uint256 _softCap,
        uint256 _startTime,
        uint256 _endTime,
        bool _softCapReached,
        bool _finalized
    ) {
        return (
            fundsRaised,
            hardCap,
            softCap,
            startTime,
            endTime,
            softCapReached,
            finalized
        );
    }
    
    receive() external payable {
        revert("Use buyTokens() function");
    }
}

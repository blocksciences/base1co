// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ICOSale
 * @dev ICO contract for token sales with configurable parameters
 */
contract ICOSale is Ownable, ReentrancyGuard, Pausable {
    IERC20 public token;
    
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
    address[] public contributors;
    
    bool public finalized;
    bool public softCapReached;
    
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event Refund(address indexed buyer, uint256 ethAmount);
    event SaleFinalized(uint256 totalRaised);
    
    constructor(
        address _token,
        uint256 _tokenPrice,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _startTime,
        uint256 _endTime
    ) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_softCap < _hardCap, "Soft cap must be less than hard cap");
        require(_startTime < _endTime, "Start time must be before end time");
        require(_startTime >= block.timestamp, "Start time must be in the future");
        
        token = IERC20(_token);
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
        require(fundsRaised < hardCap, "Hard cap reached");
        _;
    }
    
    function buyTokens() external payable nonReentrant whenNotPaused saleActive {
        require(msg.value >= minContribution, "Below minimum contribution");
        require(contributions[msg.sender] + msg.value <= maxContribution, "Exceeds maximum contribution");
        
        uint256 availableForSale = hardCap - fundsRaised;
        uint256 contribution = msg.value > availableForSale ? availableForSale : msg.value;
        uint256 refund = msg.value - contribution;
        
        uint256 tokenAmount = (contribution * (10 ** 18)) / tokenPrice;
        
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        
        contributions[msg.sender] += contribution;
        tokensPurchased[msg.sender] += tokenAmount;
        fundsRaised += contribution;
        
        if (fundsRaised >= softCap && !softCapReached) {
            softCapReached = true;
        }
        
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        emit TokensPurchased(msg.sender, contribution, tokenAmount);
        
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
    }
    
    function claimRefund() external nonReentrant {
        require(block.timestamp > endTime, "Sale not ended");
        require(!softCapReached, "Soft cap reached, no refunds");
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
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function extendSale(uint256 newEndTime) external onlyOwner {
        require(newEndTime > endTime, "New end time must be after current end time");
        endTime = newEndTime;
    }
    
    function getContributorCount() external view returns (uint256) {
        return contributors.length;
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GovernanceVault
 * @dev Token-weighted governance voting system with tier multipliers
 * @notice Create and vote on proposals using LIST tokens with tier benefits
 */
contract GovernanceVault is Ownable, ReentrancyGuard, Pausable {
    
    // Proposal states
    enum ProposalState {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Executed,
        Cancelled
    }
    
    // Proposal types
    enum ProposalType {
        Standard,           // Regular proposal
        Emergency,          // Fast-track emergency proposal
        TreasuryAllocation, // Treasury spending
        ParameterChange,    // Protocol parameter changes
        Upgrade             // Contract upgrade proposals
    }
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        ProposalType proposalType;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 quorumRequired;
        bool executed;
        bool cancelled;
        mapping(address => Vote) votes;
        bytes executionData;
        address targetContract;
    }
    
    // Vote structure
    struct Vote {
        bool hasVoted;
        bool support;      // true = for, false = against
        bool abstain;      // abstain from voting
        uint256 votingPower;
        uint256 timestamp;
    }
    
    // Interfaces
    IERC20 public immutable listToken;
    address public tierManager;
    address public stakingVault;
    
    // Governance parameters
    uint256 public proposalThreshold = 100_000 * 10**18;     // 100K tokens to propose
    uint256 public quorumPercentage = 1000;                  // 10% quorum (basis points)
    uint256 public votingDelay = 1 days;                     // Delay before voting starts
    uint256 public votingPeriod = 3 days;                    // Voting duration
    uint256 public emergencyVotingPeriod = 1 days;           // Emergency proposal duration
    uint256 public executionDelay = 2 days;                  // Timelock after passing
    
    // Proposal storage
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // User voting power snapshots
    mapping(address => uint256) public votingPowerSnapshot;
    mapping(address => uint256) public lastSnapshotBlock;
    
    // Delegation
    mapping(address => address) public delegates;
    mapping(address => uint256) public delegatedVotingPower;
    
    // Whitelist for proposal execution
    mapping(address => bool) public executionWhitelist;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalType proposalType,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        bool support,
        uint256 votingPower
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
    event ParametersUpdated(string parameter, uint256 newValue);
    
    /**
     * @dev Constructor
     * @param _listToken Address of LIST token
     * @param _tierManager Address of TierManager
     * @param initialOwner Address of contract owner
     */
    constructor(
        address _listToken,
        address _tierManager,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_listToken != address(0), "Invalid token address");
        require(_tierManager != address(0), "Invalid tier manager address");
        
        listToken = IERC20(_listToken);
        tierManager = _tierManager;
    }
    
    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param proposalType Type of proposal
     * @param executionData Encoded function call data (if applicable)
     * @param targetContract Target contract for execution (if applicable)
     */
    function propose(
        string memory title,
        string memory description,
        ProposalType proposalType,
        bytes memory executionData,
        address targetContract
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(
            getVotingPower(msg.sender) >= proposalThreshold,
            "Below proposal threshold"
        );
        require(bytes(title).length > 0, "Empty title");
        require(bytes(description).length > 0, "Empty description");
        
        // If execution data provided, validate target
        if (executionData.length > 0) {
            require(targetContract != address(0), "Invalid target contract");
            require(
                executionWhitelist[targetContract] || msg.sender == owner(),
                "Target not whitelisted"
            );
        }
        
        uint256 proposalId = proposalCount++;
        Proposal storage newProposal = proposals[proposalId];
        
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.proposalType = proposalType;
        newProposal.startTime = block.timestamp + votingDelay;
        newProposal.executionData = executionData;
        newProposal.targetContract = targetContract;
        
        // Set voting period based on proposal type
        if (proposalType == ProposalType.Emergency) {
            newProposal.endTime = newProposal.startTime + emergencyVotingPeriod;
            newProposal.quorumRequired = (listToken.totalSupply() * quorumPercentage / 2) / 10000; // Half quorum
        } else {
            newProposal.endTime = newProposal.startTime + votingPeriod;
            newProposal.quorumRequired = (listToken.totalSupply() * quorumPercentage) / 10000;
        }
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            proposalType,
            newProposal.startTime,
            newProposal.endTime
        );
        
        return proposalId;
    }
    
    /**
     * @dev Cast vote on a proposal
     * @param proposalId ID of proposal
     * @param support True for yes, false for no
     * @param abstain True to abstain
     */
    function castVote(
        uint256 proposalId,
        bool support,
        bool abstain
    ) external nonReentrant {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        require(
            block.timestamp >= proposal.startTime,
            "Voting not started"
        );
        require(
            block.timestamp <= proposal.endTime,
            "Voting ended"
        );
        require(!proposal.cancelled, "Proposal cancelled");
        require(!proposal.votes[msg.sender].hasVoted, "Already voted");
        
        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");
        
        // Record vote
        proposal.votes[msg.sender] = Vote({
            hasVoted: true,
            support: support,
            abstain: abstain,
            votingPower: votingPower,
            timestamp: block.timestamp
        });
        
        // Update vote counts
        if (abstain) {
            proposal.abstainVotes += votingPower;
        } else if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit VoteCast(msg.sender, proposalId, support, votingPower);
    }
    
    /**
     * @dev Execute a passed proposal
     * @param proposalId ID of proposal to execute
     */
    function execute(uint256 proposalId) external nonReentrant {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        
        ProposalState state = getProposalState(proposalId);
        require(state == ProposalState.Succeeded, "Proposal not succeeded");
        
        // Check execution delay (except for emergency proposals)
        if (proposal.proposalType != ProposalType.Emergency) {
            require(
                block.timestamp >= proposal.endTime + executionDelay,
                "Execution delay not met"
            );
        }
        
        proposal.executed = true;
        
        // Execute if there's execution data
        if (proposal.executionData.length > 0) {
            (bool success, ) = proposal.targetContract.call(proposal.executionData);
            require(success, "Execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal (proposer or owner only)
     * @param proposalId ID of proposal to cancel
     */
    function cancel(uint256 proposalId) external {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Already cancelled");
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(proposalId);
    }
    
    /**
     * @dev Get current state of a proposal
     * @param proposalId ID of proposal
     * @return Current ProposalState
     */
    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.cancelled) {
            return ProposalState.Cancelled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        }
        
        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }
        
        // Check if quorum met and more for votes than against
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        bool quorumMet = totalVotes >= proposal.quorumRequired;
        bool majorityFor = proposal.forVotes > proposal.againstVotes;
        
        if (quorumMet && majorityFor) {
            return ProposalState.Succeeded;
        }
        
        return ProposalState.Defeated;
    }
    
    /**
     * @dev Get voting power for an address (includes delegation and tier multiplier)
     * @param account Address to check
     * @return Voting power
     */
    function getVotingPower(address account) public view returns (uint256) {
        // Base voting power from token balance
        uint256 baseVotingPower = listToken.balanceOf(account);
        
        // Add staked tokens if StakingVault is set
        if (stakingVault != address(0)) {
            baseVotingPower += IStakingVault(stakingVault).totalStakedByUser(account);
        }
        
        // Add delegated voting power
        baseVotingPower += delegatedVotingPower[account];
        
        // Apply tier multiplier if TierManager is set
        if (tierManager != address(0)) {
            uint256 multiplier = ITierManager(tierManager).getVotingPowerMultiplier(account);
            baseVotingPower = (baseVotingPower * multiplier) / 10000;
        }
        
        return baseVotingPower;
    }
    
    /**
     * @dev Delegate voting power to another address
     * @param delegatee Address to delegate to
     */
    function delegate(address delegatee) external {
        require(delegatee != address(0), "Invalid delegatee");
        require(delegatee != msg.sender, "Cannot delegate to self");
        
        address currentDelegate = delegates[msg.sender];
        uint256 votingPower = listToken.balanceOf(msg.sender);
        
        if (stakingVault != address(0)) {
            votingPower += IStakingVault(stakingVault).totalStakedByUser(msg.sender);
        }
        
        // Remove from old delegate
        if (currentDelegate != address(0)) {
            delegatedVotingPower[currentDelegate] -= votingPower;
        }
        
        // Add to new delegate
        delegates[msg.sender] = delegatee;
        delegatedVotingPower[delegatee] += votingPower;
        
        emit DelegateChanged(msg.sender, currentDelegate, delegatee);
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId ID of proposal
     * @return Proposal details tuple
     */
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory title,
        string memory description,
        ProposalType proposalType,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        ProposalState state
    ) {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.proposalType,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            getProposalState(proposalId)
        );
    }
    
    /**
     * @dev Check if user has voted on proposal
     * @param proposalId ID of proposal
     * @param voter Address of voter
     * @return vote details
     */
    function getVote(uint256 proposalId, address voter) external view returns (
        bool hasVoted,
        bool support,
        bool abstain,
        uint256 votingPower
    ) {
        require(proposalId < proposalCount, "Invalid proposal");
        Vote storage vote = proposals[proposalId].votes[voter];
        
        return (
            vote.hasVoted,
            vote.support,
            vote.abstain,
            vote.votingPower
        );
    }
    
    /**
     * @dev Set proposal threshold (owner only)
     * @param threshold New threshold
     */
    function setProposalThreshold(uint256 threshold) external onlyOwner {
        require(threshold >= 10_000 * 10**18, "Threshold too low");
        proposalThreshold = threshold;
        
        emit ParametersUpdated("proposalThreshold", threshold);
    }
    
    /**
     * @dev Set quorum percentage (owner only)
     * @param percentage New percentage (basis points)
     */
    function setQuorumPercentage(uint256 percentage) external onlyOwner {
        require(percentage >= 100 && percentage <= 5000, "Invalid percentage"); // 1-50%
        quorumPercentage = percentage;
        
        emit ParametersUpdated("quorumPercentage", percentage);
    }
    
    /**
     * @dev Set voting periods (owner only)
     * @param delay Voting delay
     * @param period Regular voting period
     * @param emergencyPeriod Emergency voting period
     */
    function setVotingPeriods(
        uint256 delay,
        uint256 period,
        uint256 emergencyPeriod
    ) external onlyOwner {
        require(delay >= 1 hours && delay <= 7 days, "Invalid delay");
        require(period >= 1 days && period <= 14 days, "Invalid period");
        require(emergencyPeriod >= 1 hours && emergencyPeriod <= 3 days, "Invalid emergency period");
        
        votingDelay = delay;
        votingPeriod = period;
        emergencyVotingPeriod = emergencyPeriod;
        
        emit ParametersUpdated("votingDelay", delay);
        emit ParametersUpdated("votingPeriod", period);
        emit ParametersUpdated("emergencyVotingPeriod", emergencyPeriod);
    }
    
    /**
     * @dev Set execution delay (owner only)
     * @param delay New execution delay
     */
    function setExecutionDelay(uint256 delay) external onlyOwner {
        require(delay >= 1 days && delay <= 14 days, "Invalid delay");
        executionDelay = delay;
        
        emit ParametersUpdated("executionDelay", delay);
    }
    
    /**
     * @dev Set StakingVault address
     * @param _stakingVault Address of StakingVault
     */
    function setStakingVault(address _stakingVault) external onlyOwner {
        require(_stakingVault != address(0), "Invalid address");
        stakingVault = _stakingVault;
    }
    
    /**
     * @dev Whitelist contract for proposal execution
     * @param target Contract address
     * @param status Whitelist status
     */
    function setExecutionWhitelist(address target, bool status) external onlyOwner {
        require(target != address(0), "Invalid address");
        executionWhitelist[target] = status;
    }
    
    /**
     * @dev Pause governance (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause governance
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

interface ITierManager {
    function getVotingPowerMultiplier(address user) external view returns (uint256);
}

interface IStakingVault {
    function totalStakedByUser(address user) external view returns (uint256);
}
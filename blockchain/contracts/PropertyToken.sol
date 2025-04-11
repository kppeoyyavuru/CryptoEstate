// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyToken
 * @dev ERC20 token representing fractional ownership of a real estate property
 */
contract PropertyToken is ERC20, Ownable {
    // Property details
    uint256 public propertyId;
    uint256 public propertyValue;
    uint256 public totalShares;
    uint256 public tokenPrice;
    uint256 public availableShares;
    uint256 public minInvestment;
    string public propertyURI;
    bool public isFundingComplete;
    
    // Investment tracking
    mapping(address => uint256) public investments;
    address[] public investors;
    
    // Rental income tracking
    uint256 public totalRentalIncome;
    mapping(address => uint256) public unclaimedRentalIncome;
    mapping(address => uint256) public claimedRentalIncome;
    
    // Events
    event SharesPurchased(address indexed investor, uint256 amount, uint256 shares);
    event RentalIncomeDistributed(uint256 amount);
    event RentalIncomeClaimed(address indexed investor, uint256 amount);
    event FundingCompleted();
    
    /**
     * @dev Constructor for creating a new property token
     * @param _name The name of the token
     * @param _symbol The symbol of the token
     * @param _propertyId The ID of the property in the platform
     * @param _propertyValue The total value of the property in wei
     * @param _totalShares The total number of shares to issue
     * @param _minInvestment Minimum investment amount in wei
     * @param _propertyURI URI pointing to property metadata
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _propertyId,
        uint256 _propertyValue,
        uint256 _totalShares,
        uint256 _minInvestment,
        string memory _propertyURI
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        propertyId = _propertyId;
        propertyValue = _propertyValue;
        totalShares = _totalShares;
        availableShares = _totalShares;
        tokenPrice = _propertyValue / _totalShares;
        minInvestment = _minInvestment;
        propertyURI = _propertyURI;
        isFundingComplete = false;
    }
    
    /**
     * @dev Allows users to purchase shares in the property
     */
    function purchaseShares() external payable {
        require(!isFundingComplete, "Funding for this property is complete");
        require(msg.value >= minInvestment, "Investment below minimum amount");
        require(availableShares > 0, "No shares available");
        
        // Calculate number of shares to purchase
        uint256 shareAmount = msg.value / tokenPrice;
        require(shareAmount > 0, "Investment too small for any shares");
        require(shareAmount <= availableShares, "Not enough shares available");
        
        // Calculate actual cost (refund any excess)
        uint256 cost = shareAmount * tokenPrice;
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        // Mint tokens to the investor
        _mint(msg.sender, shareAmount);
        
        // Update investment tracking
        if (investments[msg.sender] == 0) {
            investors.push(msg.sender);
        }
        investments[msg.sender] += cost;
        availableShares -= shareAmount;
        
        // Check if funding is complete
        if (availableShares == 0) {
            isFundingComplete = true;
            emit FundingCompleted();
        }
        
        emit SharesPurchased(msg.sender, cost, shareAmount);
    }
    
    /**
     * @dev Distributes rental income to all shareholders
     */
    function distributeRentalIncome() external payable onlyOwner {
        require(isFundingComplete, "Property funding not yet complete");
        require(msg.value > 0, "No rental income to distribute");
        
        totalRentalIncome += msg.value;
        
        // Distribute income proportionally to shareholders
        for (uint i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 investorShares = balanceOf(investor);
            if (investorShares > 0) {
                uint256 shareOfRental = (msg.value * investorShares) / totalSupply();
                unclaimedRentalIncome[investor] += shareOfRental;
            }
        }
        
        emit RentalIncomeDistributed(msg.value);
    }
    
    /**
     * @dev Allows shareholders to claim their rental income
     */
    function claimRentalIncome() external {
        uint256 amount = unclaimedRentalIncome[msg.sender];
        require(amount > 0, "No rental income to claim");
        
        unclaimedRentalIncome[msg.sender] = 0;
        claimedRentalIncome[msg.sender] += amount;
        
        payable(msg.sender).transfer(amount);
        
        emit RentalIncomeClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Returns investment details for a specific investor
     * @param investor The address of the investor
     * @return investmentAmount The amount invested in wei
     * @return shareCount The number of shares owned
     * @return ownership The percentage of ownership (scaled by 10000)
     * @return unclaimedIncome The unclaimed rental income
     * @return claimedIncome The claimed rental income
     */
    function getInvestorDetails(address investor) external view returns (
        uint256 investmentAmount,
        uint256 shareCount,
        uint256 ownership,
        uint256 unclaimedIncome,
        uint256 claimedIncome
    ) {
        shareCount = balanceOf(investor);
        investmentAmount = investments[investor];
        ownership = totalSupply() > 0 ? (shareCount * 10000) / totalSupply() : 0;
        unclaimedIncome = unclaimedRentalIncome[investor];
        claimedIncome = claimedRentalIncome[investor];
    }
    
    /**
     * @dev Override of ERC20 transfer to update rental income tracking
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        address from = _msgSender();
        
        // First, transfer unclaimed rental income proportionally
        if (unclaimedRentalIncome[from] > 0 && balanceOf(from) > 0) {
            uint256 transferIncome = (unclaimedRentalIncome[from] * amount) / balanceOf(from);
            unclaimedRentalIncome[from] -= transferIncome;
            unclaimedRentalIncome[to] += transferIncome;
        }
        
        // Add to investors array if new investor
        if (balanceOf(to) == 0 && amount > 0) {
            investors.push(to);
        }
        
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override of ERC20 transferFrom to update rental income tracking
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        // First, transfer unclaimed rental income proportionally
        if (unclaimedRentalIncome[from] > 0 && balanceOf(from) > 0) {
            uint256 transferIncome = (unclaimedRentalIncome[from] * amount) / balanceOf(from);
            unclaimedRentalIncome[from] -= transferIncome;
            unclaimedRentalIncome[to] += transferIncome;
        }
        
        // Add to investors array if new investor
        if (balanceOf(to) == 0 && amount > 0) {
            investors.push(to);
        }
        
        return super.transferFrom(from, to, amount);
    }
} 
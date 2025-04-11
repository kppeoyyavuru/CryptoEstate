// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PropertyToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyFactory
 * @dev Factory contract for creating and managing PropertyToken contracts
 */
contract PropertyFactory is Ownable {
    // Property token addresses
    PropertyToken[] public properties;
    mapping(uint256 => PropertyToken) public propertyIdToToken;
    mapping(address => bool) public isPropertyToken;
    
    // Platform fee configuration
    uint256 public platformFeePercentage = 100; // 1% by default (scaled by 10000)
    address public feeCollector;
    
    // Property metadata
    struct PropertyDetails {
        uint256 propertyId;
        address tokenAddress;
        string name;
        string symbol;
        uint256 propertyValue;
        uint256 totalShares;
        uint256 availableShares;
        uint256 minInvestment;
        string propertyURI;
        bool isFundingComplete;
        uint256 createdAt;
    }
    
    // Events
    event PropertyTokenCreated(uint256 indexed propertyId, address indexed tokenAddress, string name, string propertyURI);
    event PlatformFeeUpdated(uint256 newFeePercentage);
    event FeeCollectorUpdated(address newFeeCollector);
    
    /**
     * @dev Constructor for PropertyFactory
     * @param _feeCollector Address that will receive platform fees
     */
    constructor(address _feeCollector) Ownable(msg.sender) {
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Creates a new property token
     * @param _name Name of the property token
     * @param _symbol Symbol of the property token
     * @param _propertyValue Total value of the property in wei
     * @param _totalShares Total number of shares to be issued
     * @param _minInvestment Minimum investment amount in wei
     * @param _propertyURI URI pointing to the property metadata
     * @return propertyId Id of the created property
     * @return tokenAddress Address of the created property token contract
     */
    function createProperty(
        string memory _name,
        string memory _symbol,
        uint256 _propertyValue,
        uint256 _totalShares,
        uint256 _minInvestment,
        string memory _propertyURI
    ) external onlyOwner returns (uint256 propertyId, address tokenAddress) {
        propertyId = properties.length;
        
        // Create new property token
        PropertyToken propertyToken = new PropertyToken(
            _name,
            _symbol,
            propertyId,
            _propertyValue,
            _totalShares,
            _minInvestment,
            _propertyURI
        );
        
        // Transfer ownership to the factory
        propertyToken.transferOwnership(address(this));
        
        // Store the property token
        properties.push(propertyToken);
        propertyIdToToken[propertyId] = propertyToken;
        isPropertyToken[address(propertyToken)] = true;
        tokenAddress = address(propertyToken);
        
        emit PropertyTokenCreated(propertyId, tokenAddress, _name, _propertyURI);
    }
    
    /**
     * @dev Invests in a property by purchasing shares
     * @param _propertyId The ID of the property to invest in
     */
    function investInProperty(uint256 _propertyId) external payable {
        PropertyToken propertyToken = propertyIdToToken[_propertyId];
        require(address(propertyToken) != address(0), "Property does not exist");
        require(!propertyToken.isFundingComplete(), "Property funding is complete");
        
        // Calculate platform fee
        uint256 fee = (msg.value * platformFeePercentage) / 10000;
        uint256 investmentAmount = msg.value - fee;
        
        // Transfer fee to fee collector
        if (fee > 0) {
            payable(feeCollector).transfer(fee);
        }
        
        // Forward the investment to the property token
        (bool success, ) = address(propertyToken).call{value: investmentAmount}(
            abi.encodeWithSignature("purchaseShares()")
        );
        require(success, "Failed to purchase shares");
    }
    
    /**
     * @dev Distributes rental income to property token holders
     * @param _propertyId The ID of the property
     */
    function distributeRentalIncome(uint256 _propertyId) external payable onlyOwner {
        PropertyToken propertyToken = propertyIdToToken[_propertyId];
        require(address(propertyToken) != address(0), "Property does not exist");
        require(propertyToken.isFundingComplete(), "Property funding not complete");
        
        // Calculate platform fee
        uint256 fee = (msg.value * platformFeePercentage) / 10000;
        uint256 rentalAmount = msg.value - fee;
        
        // Transfer fee to fee collector
        if (fee > 0) {
            payable(feeCollector).transfer(fee);
        }
        
        // Forward the rental income to the property token
        (bool success, ) = address(propertyToken).call{value: rentalAmount}(
            abi.encodeWithSignature("distributeRentalIncome()")
        );
        require(success, "Failed to distribute rental income");
    }
    
    /**
     * @dev Claims rental income for a specific property
     * @param _propertyId The ID of the property
     */
    function claimRentalIncome(uint256 _propertyId) external {
        PropertyToken propertyToken = propertyIdToToken[_propertyId];
        require(address(propertyToken) != address(0), "Property does not exist");
        
        // Call the property token's claimRentalIncome function
        (bool success, ) = address(propertyToken).call(
            abi.encodeWithSignature("claimRentalIncome()")
        );
        require(success, "Failed to claim rental income");
    }
    
    /**
     * @dev Updates the platform fee percentage
     * @param _newFeePercentage New fee percentage (scaled by 10000)
     */
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = _newFeePercentage;
        emit PlatformFeeUpdated(_newFeePercentage);
    }
    
    /**
     * @dev Updates the fee collector address
     * @param _newFeeCollector New fee collector address
     */
    function updateFeeCollector(address _newFeeCollector) external onlyOwner {
        require(_newFeeCollector != address(0), "Invalid address");
        feeCollector = _newFeeCollector;
        emit FeeCollectorUpdated(_newFeeCollector);
    }
    
    /**
     * @dev Gets property details by ID
     * @param _propertyId The ID of the property
     * @return details The property details
     */
    function getPropertyDetails(uint256 _propertyId) external view returns (PropertyDetails memory details) {
        PropertyToken propertyToken = propertyIdToToken[_propertyId];
        require(address(propertyToken) != address(0), "Property does not exist");
        
        details.propertyId = _propertyId;
        details.tokenAddress = address(propertyToken);
        details.name = propertyToken.name();
        details.symbol = propertyToken.symbol();
        details.propertyValue = propertyToken.propertyValue();
        details.totalShares = propertyToken.totalShares();
        details.availableShares = propertyToken.availableShares();
        details.minInvestment = propertyToken.minInvestment();
        details.propertyURI = propertyToken.propertyURI();
        details.isFundingComplete = propertyToken.isFundingComplete();
        details.createdAt = block.timestamp;
    }
    
    /**
     * @dev Gets the total number of properties
     * @return count The number of properties
     */
    function getPropertyCount() external view returns (uint256 count) {
        return properties.length;
    }
    
    /**
     * @dev Gets investor details for a specific property
     * @param _propertyId The ID of the property
     * @param _investor The address of the investor
     * @return investmentAmount The amount invested
     * @return shareCount The number of shares owned
     * @return ownership The percentage of ownership (scaled by 10000)
     * @return unclaimedIncome The unclaimed rental income
     * @return claimedIncome The claimed rental income
     */
    function getInvestorDetails(uint256 _propertyId, address _investor) external view returns (
        uint256 investmentAmount,
        uint256 shareCount,
        uint256 ownership,
        uint256 unclaimedIncome,
        uint256 claimedIncome
    ) {
        PropertyToken propertyToken = propertyIdToToken[_propertyId];
        require(address(propertyToken) != address(0), "Property does not exist");
        
        return propertyToken.getInvestorDetails(_investor);
    }
    
    /**
     * @dev Allows the contract to receive Ether
     */
    receive() external payable {}
} 
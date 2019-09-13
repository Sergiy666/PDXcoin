pragma solidity ^0.5.0;

import "./abstract/UpgradeabilityProxy.sol";
import "./abstract/TokenStorage.sol";
import "./abstract/OwnershipStorage.sol";

contract TokenProxy is UpgradeabilityProxy, TokenStorage, OwnershipStorage {
    constructor (
        string memory name,
        string memory symbol,
        uint8 decimals
    ) 
        public 
    {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
        _tokensMinted = false;
    } 
}
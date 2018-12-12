pragma solidity ^0.4.24;


contract Owned {
    // State variable
    address public owner;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // constructor
    function Owned() public {
        owner = msg.sender;
    }
}

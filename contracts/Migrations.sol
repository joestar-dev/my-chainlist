pragma solidity ^0.4.24;


contract Migrations {
    address public owner;
    uint public lastCompletedMigration;

    modifier restricted() {
        require(owner == msg.sender);
        _;
    }

    function Migrations() public {
        owner = msg.sender;
    }

    function setCompleted(uint completed) public restricted {
        lastCompletedMigration = completed;
    }

    function upgrade(address newAddress) public restricted {
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }
}

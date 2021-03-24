pragma solidity >0.4.99 <0.6.0;

contract Greetings {
    string message;

    constructor() public {
        message = "I am ready!"
    }

    function setGreetings(string memory _message) public {
        message = _message;
    }
    function getGreetings() public view returns (string memory) {
        return message;
    }
}
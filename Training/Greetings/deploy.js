// Load library to interact with Ethereum nodes
const Web3 = require("web3");

// Get the Application Binary Interface (ABI) and bytecode from compiled contract. This will effectively run the compile script as well.
const {interface, bytecode} = require("./compile");

// Create a new instance of web3 plugged into Ganache
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

// Function to deploy the contract
const deploy = async () => {

    // Retrieve the list of accounts asynchronously, which is why we use async/await
    const accounts = await web3.eth.getAccounts();

    // Create a contract instnce using the interface to the contract (Application Binary Interface - ABI)
    // Deploy the bytecode of the contract using the first account and allowing Ganache to expend a maximum of 1 million gas units in the process

    const result = await new web3.eth.Contract(interface)
        .deploy({
            data: bytecode
        })
        .send({from: accounts[0], gas: "1000000"});
    
    // Keep the unique address of the deploed contract. You will need it to be able to interact with the contract
    
    console.log("contract address: ", result.options.address);

    };
// Deploy the contract
deploy();
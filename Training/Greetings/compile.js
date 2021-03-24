// Load a library to work with files and folders
const path = require("path");

// Load a library to access the file system
const fs = require("fs-extra");


// Load the Solidity compiler
const solc = require("solc");


// Clean up the build folder
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

// Get the path of the contract
const contractPath = path.resolve(__dirname, "contracts", "Greetings.sol");


// Configuration for the Solidity compiler
const params = {
    language: "Solidity",
    sources: {
        "contract": {
            content: fs.readFileSync(contractPath, 'utf-8')
        }
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["abi", "evm.bytecode"] //ABI = Application Binary Interface, which is the API of our contract
            }
        }
    }
};

// Compile the contract and store the result in the output constant
const output = JSON.parse(solc.compile(JSON.stringify(params)));

// Use or create the build folder
fs.ensureDirSync(buildPath);

// Create the JSON file and store the contract's compilation result
fs.outputJsonSync(
    path.resolve(buildPath, "Greetings.json"),
    output.contracts.contract.Greetings
);

// Export Greetings contract ABI and bytecode, which we will need later to deploy and interact with the contract.
module.exports.interface = output.contracts.contract.Greetings.abi;
module.exports.bytecode = output.contracts.contract.Greetings.evm.bytecode.object;
const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');
/*
* connect to ethereum node
*/
const accountAddress = '0xc389b199ac6f28856857e0340d343462aba5ff3d'; // user
const privateKeyPass = 'shubham'
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const timeout = 120;
var abi, bytecode, MyContract;

//MyContract=web3.eth.contract(abi)

function compile() {
    let source = fs.readFileSync("../Contracts/Gallery.sol", 'utf8');

    console.log('compiling contract...');
    let compiledContract = solc.compile(source);
    console.log('done');

    for (let contractName in compiledContract.contracts) {

        bytecode = compiledContract.contracts[contractName].bytecode;
        abi = JSON.parse(compiledContract.contracts[contractName].interface);
    }
}

function deployContract() {


    let gasEstimate = web3.eth.estimateGas({data: '0x' + bytecode});
    MyContract = new web3.eth.Contract(abi);

    web3.eth.personal.unlockAccount(accountAddress, privateKeyPass, 1000);
    MyContract.deploy({
        arguments: [timeout],
        data: '0x' + bytecode,
        })
        .send({
            from: accountAddress,
            gas: 4000000,
            gasPrice: '300000000',
        }, (err, txHash) => {
            console.log('send:', err, txHash);
        })
        .on('error', (err) => {
            console.log('error:', err);
        })
        .on('transactionHash', (err) => {
            console.log('transactionHash:', err);
        })
        .on('receipt', (receipt) => {
            console.log('Contract Address:',receipt.contractAddress);
        });
}

function getDeployedTS(contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var op = contractInstance.methods.isRegistrationClosed().call().then(e => {
        console.log(e)
    })
}

console.log("compilation started")
compile()
console.log("Deployment started")
//deployContract()
console.log("reading data ")
getDeployedTS("0x1bee092790ce55b7d19343fcd5ecf784c5e9a309")




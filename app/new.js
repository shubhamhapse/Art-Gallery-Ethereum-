var Web3 = require('web3');

var Tx = require('ethereumjs-tx');
const fs = require('fs');
const solc = require('solc');

const accountAddress1='0x6795a63DFdEC817a4d1F756D98C5B5E6330D3234'
const privateKeyPass = 'shubham'

const timeoutRegistration = 320;// registration time out in sec.
const timeoutVoting = 320;
const contractAddressGlobal = '0x0123a288f45960a4e74bd1181a1207976222aef6';


var abi, bytecode, MyContract;

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var privateKey = new Buffer('016403ccbff606d7be356e757ac13abe59ef64426ff61c6889f7ed5072c49715', 'hex')

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
const deploy = async()=>{

    var contract = new web3.eth.Contract(abi);
    const hexdata = contract.deploy({
        data: '0x' + bytecode,
        arguments:[timeoutRegistration,timeoutVoting]
    }).encodeABI()

    const nonce = await web3.eth.getTransactionCount( accountAddress1 );
    const nonceHex = web3.utils.toHex(nonce)
    const gasPriceHex = web3.utils.toHex(18000000000);
    const gasLimit = 923600;
    const gasLimitHex = web3.utils.toHex(gasLimit);
    var rawTx = {
        nonce: nonceHex,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        data: "0x"+hexdata,
        from:accountAddress1
    }

    var tx = new Tx(rawTx);
    tx.sign(privateKey);

    var serializedTx = tx.serialize();

    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', console.log);

};
compile()
deploy().then(console.log);
const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

//replace this with your ethereum address and credentials.
const accountAddress = '0xc389b199ac6f28856857e0340d343462aba5ff3d'; // user
const privateKeyPass = ''
const timeout = 320;// registration time out in sec.
const contractAddressGlobal='0x8742dbB21277e478Cb3aF44F751aDcdBA299853f';




var abi, bytecode, MyContract;

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));


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
        });
}

function getContractBalance(contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    contractInstance.methods.getBalance().call().then(e => {
        console.log(e)
    })
}

function isRegistrationClosed(contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    contractInstance.methods.timeoutstatus().call().then(e => {
        console.log(e)
    })
}

function isVotingStated(contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    contractInstance.methods.isVotingStarted().call().then(e => {
        console.log(e)
    })
}

function isCertifiedPainting(id,contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    contractInstance.methods.isCertifiedPainting(id).call().then(e => {
        console.log(e)
    })
}

function listAllPaintings(contractAddress){
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    contractInstance.methods.getTotalPaintings().call().then(e => {
        console.log(e)
        for (let i=0;i<e;i++){
            contractInstance.methods.getPaintingInfo(i).call().then(e=>{
                console.log(e)
            })
        }
    })
}

function listAllValidatedPaintings(contractAddress){
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    contractInstance.methods.getTotalPaintings().call().then(count => {
        for (let i=0;i<count;i++){
            contractInstance.methods.isCertifiedPainting(i).call().then(result=>{
                console.log(result)
            })
        }
    })
}

function registerArtist(addrArtist, pass, name, url, email, contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var method = contractInstance.methods.registerArtist(name, url, email);
    var encodedABI = method.encodeABI();
    var n;

    web3.eth.getTransactionCount(addrArtist).then(_nonce => {
        n = '0x' + _nonce.toString(16);
        console.log(n)
        var tx = {
            from: addrArtist,
            to: contractAddress,
            gas: 2000000,
            gasPrice: '300000000',
            data: encodedABI,
            value: 100000000000000000,
            nonce: n

        };
        console.log(tx)
        web3.eth.personal.unlockAccount(addrArtist, pass, 1000);
        web3.eth.signTransaction(tx).then(signed => {
            let tran = web3.eth.sendSignedTransaction(signed.raw);

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
            });

            tran.on('error', console.error);
        });
    })
}

function vote(address, pass, paintingID, contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var method = contractInstance.methods.vote(paintingID);
    var encodedABI = method.encodeABI();
    var n;

    web3.eth.getTransactionCount(address).then(_nonce => {
        n = '0x' + _nonce.toString(16);
        console.log(n)
        var tx = {
            from: address,
            to: contractAddress,
            gas: 2000000,
            gasPrice: '300000000',
            data: encodedABI,
            value: 0,
            nonce: n

        };
        console.log(tx)
        web3.eth.personal.unlockAccount(address, pass, 1000);
        web3.eth.signTransaction(tx).then(signed => {
            let tran = web3.eth.sendSignedTransaction(signed.raw);

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
            });

            tran.on('error', console.error);
        });
    })
}


function stopVoting(address, pass, contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var method = contractInstance.methods.stopVoting();
    var encodedABI = method.encodeABI();
    var n;

    web3.eth.getTransactionCount(address).then(_nonce => {
        n = '0x' + _nonce.toString(16);
        console.log(n)
        var tx = {
            from: address,
            to: contractAddress,
            gas: 2000000,
            gasPrice: '300000000',
            data: encodedABI,
            value: 0,
            nonce: n

        };
        console.log(tx)
        web3.eth.personal.unlockAccount(address, pass, 1000);
        web3.eth.signTransaction(tx).then(signed => {
            let tran = web3.eth.sendSignedTransaction(signed.raw);

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
            });

            tran.on('error', console.error);
        });
    })
}

function declareWinner(address, pass, contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var method = contractInstance.methods.declareWinner();
    var encodedABI = method.encodeABI();
    var n;

    web3.eth.getTransactionCount(address).then(_nonce => {
        n = '0x' + _nonce.toString(16);
        console.log(n)
        var tx = {
            from: address,
            to: contractAddress,
            gas: 2000000,
            gasPrice: '300000000',
            data: encodedABI,
            value: 0,
            nonce: n

        };
        console.log(tx)
        web3.eth.personal.unlockAccount(address, pass, 1000);
        web3.eth.signTransaction(tx).then(signed => {
            let tran = web3.eth.sendSignedTransaction(signed.raw);

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
            });

            tran.on('error', console.error);
        });
    })
}


function validatePainting(addressOwner, pass,paintingId, contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var method = contractInstance.methods.validatePaintings(paintingId);
    var encodedABI = method.encodeABI();
    var n;

    web3.eth.getTransactionCount(addressOwner).then(_nonce => {
        n = '0x' + _nonce.toString(16);
        console.log(n)
        var tx = {
            from: addressOwner,
            to: contractAddress,
            gas: 2000000,
            gasPrice: '300000000',
            data: encodedABI,
            value: 0,
            nonce: n

        };
        console.log(tx)
        web3.eth.personal.unlockAccount(addressOwner, pass, 1000);
        web3.eth.signTransaction(tx).then(signed => {
            let tran = web3.eth.sendSignedTransaction(signed.raw);

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
            });

            tran.on('error', console.error);
        });
    })
}


function validationDone(addressOwner, pass, contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var method = contractInstance.methods.validationDone();
    var encodedABI = method.encodeABI();
    var n;

    web3.eth.getTransactionCount(addressOwner).then(_nonce => {
        n = '0x' + _nonce.toString(16);
        console.log(n)
        var tx = {
            from: addressOwner,
            to: contractAddress,
            gas: 2000000,
            gasPrice: '300000000',
            data: encodedABI,
            value: 0,
            nonce: n

        };
        console.log(tx)
        web3.eth.personal.unlockAccount(addressOwner, pass, 1000);
        web3.eth.signTransaction(tx).then(signed => {
            let tran = web3.eth.sendSignedTransaction(signed.raw);

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
            });

            tran.on('error', console.error);
        });
    })
}

function claimReward(addressOwner, pass, contractAddress) {
    var contractInstance = new web3.eth.Contract(abi, contractAddress);
    var method = contractInstance.methods.claimReward();
    var encodedABI = method.encodeABI();
    var n;

    web3.eth.getTransactionCount(addressOwner).then(_nonce => {
        n = '0x' + _nonce.toString(16);
        console.log(n)
        var tx = {
            from: addressOwner,
            to: contractAddress,
            gas: 2000000,
            gasPrice: '300000000',
            data: encodedABI,
            value: 0,
            nonce: n

        };
        console.log(tx)
        web3.eth.personal.unlockAccount(addressOwner, pass, 1000);
        web3.eth.signTransaction(tx).then(signed => {
            let tran = web3.eth.sendSignedTransaction(signed.raw);

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
            });

            tran.on('error', console.error);
        });
    })
}







console.log("compilation started")
compile() //dont comment this


// first step-> deploy contract and update contractAddressGlobal variable for next use comment after that
deployContract()

//register artist with painting details
registerArtist(accountAddress,privateKeyPass,"shubham","url://sam#.jpg","shapse778@gmail.com",contractAddressGlobal)
//can add multiple such paintings within timeout given in const.

//It will return balance deposited in contract after registration of painting
getContractBalance(contractAddressGlobal)

//lists all paintings that are registered for competition.
//contains ID, name ,url, email, total votes to that painting.
listAllPaintings(contractAddressGlobal)


//contract state variable check
isVotingStated(contractAddressGlobal)
isRegistrationClosed(contractAddressGlobal) //checks for timeout


//only after registration time out you can call this function
//paintingID is the id of painting that needs to approve
//only museum can call this
validatePainting(accountAddress,privateKeyPass,0,contractAddressGlobal)


//after validation of paintings need to start voting
// meaning -> validation done now start voting.
validationDone(accountAddress,privateKeyPass,contractAddressGlobal)


//lists all validated paintings in true/false per line
//line no represents painting ID
listAllValidatedPaintings(contractAddressGlobal)


//by seeing list of valid paintings (O/P of above function)
//people can vote
vote(accountAddress,privateKeyPass,0,contractAddressGlobal)

//after some time museum can stop voting process
stopVoting(accountAddress,privateKeyPass,contractAddressGlobal)

//after voting anyone can asks for winner.
declareWinner(accountAddress,privateKeyPass,contractAddressGlobal)


//only winner can call this
//actual call is
//accountAddress.transfer(address(this).balance);
//will transfer all registration fee to sender address.
claimReward(accountAddress,privateKeyPass,contractAddressGlobal)



//all this functions needs to run one by one and in orderly fashion.
//state variable rejects unexpected transaction like voting before validation etc.
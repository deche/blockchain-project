var EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1');
const {utxos, mempool} = require('../db');
const Transaction = require('../models/Transaction');
const UTXO = require('../models/UTXO');

getBalance = (address) => {
    const ourUTXOs = utxos.filter(x => {
        return x.owner === address && !x.spent;
    });
    console.log(ourUTXOs);
    const sum = ourUTXOs.reduce((p, c) => p + c.amount, 0);
    
    return sum;
}

module.exports = function (app)  {
  
    app.get('/get-balance/:address', function(req, res) {
        const sum = getBalance(req.params.address);
        console.log('sum', sum);
        res.send({sum});
    });

    app.get('/utxos', function(req, res) {
        res.send(utxos);
    });

    app.get('/generate', function(req, res) {

        let key = ec.genKeyPair();
        let publicKey = key.getPublic().encode('hex');
        console.log(`publicKey: ${publicKey}` );
        let privateKey = key.getPrivate().toString(16);
        console.log(`privateKey: ${privateKey}`);

        res.send({publicKey, privateKey});
    });    

    app.post('/submit-transaction', function(req, res) {
        const {sender, recipient, amount, signatureR, signatureS} = req.body;

        // verify
        const key = ec.keyFromPublic(sender, 'hex');
        const msg = `${amount} - ${recipient}`;
        const msgHash = SHA256(msg).toString();
      
        const signature = {
          r: signatureR,
          s: signatureS
        };
      
        if(key.verify(msgHash, signature)) {
            // check if transaction is valid for mempool
            const senderBalance = getBalance(sender);
            if(senderBalance < amount) {
                // not enough balance
                res.send({ message: "Not enough balance"});
            } else {
                let availableBalance = senderBalance - amount;
                let mempoolSpending = 0;
                // check spending on mempool
                mempool.forEach((tx) => {
                    tx.inputs.forEach((input) => {
                        if(input.owner==='sender') {
                            mempoolSpending += input.amount;
                        }
                    })
                });

                if(mempoolSpending > availableBalance) {
                    res.send({ message: "Not enough balance"});
                } else {
                    let inputBalance = 0;
                    let i = 0;
                    let inputs = [];
                    while(inputBalance < amount && i < utxos.length) {
                        if(utxos[i].owner===sender && utxos[i].spent === false) {
                            inputs.push(utxos[i]);
                            inputBalance += utxos[i].amount;
                        }
                        i++;
                    }

                    let outputs = [];

                    const remainderSender = inputBalance - amount;
                    if (remainderSender > 0) {
                        const remainderSenderUTXO = new UTXO(sender, remainderSender);
                        outputs.push(remainderSenderUTXO);
                    }

                    // add to mempool
                    const newUTXO = new UTXO(recipient, amount);
                    outputs.push(newUTXO);
                    const newTX = new Transaction(inputs, outputs);

                    mempool.push(newTX);
                    res.send({message: "transaction submitted"});
                }
    
            }

        }
    });

}
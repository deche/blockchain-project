const db = require('../db');
var fs = require("fs");
const Block = require('../models/Block');
const Transaction = require('../models/Transaction');
const UTXO = require('../models/UTXO');
const TARGET_DIFFICULTY = BigInt("0X00" + "F".repeat(62));
const BLOCK_REWARD = 10;
const MAX_TRANSACTIONS_PER_BLOCK = 5;

const PUBLIC_KEY = "04d72f9b65c246123ced68611bed5f1eca52e73b9c04c2eff44e313721e6b40d583071cc8a186dc1fc7db93132d372ac6dc8b2d889e6deccb88a333726f01ef48d";
const PRIVATE_KEY = "9bd85fb6f5e6d33954060e7a2cf5b692acbea5fb9a69925704ff145e021a66b6";

function mine() {
    fs.readFile("./mine/isMining.txt", "utf-8", (err, data) => {
        if (err) { console.log(err) }
        if(data==="false") {
            return;
        } else {
            const block = new Block();

            const coinbaseUTXO = new UTXO(PUBLIC_KEY, BLOCK_REWARD);
            const coinbaseTX = new Transaction([], [coinbaseUTXO]);
            block.addTransaction(coinbaseTX);

            // TODO: add transactions from the mempool
            console.log('mempool length', db.mempool.length);
            while(db.mempool.length > 0 && block.transactions.length < MAX_TRANSACTIONS_PER_BLOCK) {
                let mempoolTX = db.mempool.pop();
                console.log("mempoolTX", mempoolTX);
                block.addTransaction(mempoolTX);
            }

            while(BigInt('0x' + block.hash()) >= TARGET_DIFFICULTY) {
                //console.log(BigInt('0x' + block.hash()));
                block.nonce++;
            }

            block.execute();
            
            db.blockchain.addBlock(block);
            console.log(`Just mined block ${db.blockchain.blockHeight()} with a hash of ${block.hash()} at nonce ${block.nonce}`);
        }
    })

    setTimeout(mine, 3500);
}


module.exports = {
    mine
};
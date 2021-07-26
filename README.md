# blockchain-project

A simple blockchain node:
- SHA256 for authentication
- proof of work 
- mining rewards
- mempool to hold pending transactions
- APIs:
  /get-balance/:address
  /utxos (list all utxos in the chain)
  /generate (generate a new address along with its private key)
  /submit-transaction (user can send to another address, needs sender's signature. transaction will be kept in mempool.) 
- run node mine/startMining.js to start mining
- run node mine/stopMining.js to stop mining
  
  

TO DO:
- Add nonce for every transaction to prevent double spent
- Front end for user to interact easily
- Verify sender balance before adding to the blockchain. Currently only verify before adding to the mempool. (sender balance might not be enough if node > 1)
- P2P Network: allow multiple nodes to broadcast new block from the mempool and broadcast new proof of work solution
- persistence storage for db

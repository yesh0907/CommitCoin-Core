const Block = require('./Block');

class Blockchain {
    constructor() {
        this.blockchain = [this.getGenisisBlock()]; 
    }

    calculateHashForBlock(block) {
        return Block.calculateHash(block.index, block.prevHash, block.timestamp, block.data);
    }
    
    getLastBlock() { return this.blockchain[this.blockchain.length - 1] };
    
    isValidNewBlock(newBlock, prevBlock) {
        if (prevBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        }
        else if (newBlock.prevHash !== prevBlock.hash) {
            console.log("prev hash doesn't match");
            return false;
        }
        else if (this.calculateHashForBlock(newBlock) !== newBlock.hash) {
            console.log('invalid hash on new block');
            return false;
        }
        return true;
    }
    
    addBlock(newBlock) {
        if (this.isValidNewBlock(newBlock, this.getLastBlock())) {
            this.blockchain.push(newBlock);
        }
    }
    
    getGenisisBlock() {
        return new Block(
            0,
            "0", 
            new Date().getTime() / 1000,
            "Initialized Blockchain",
            '3ae9b6dfa1a745ef6528f944702ecd4586f231b95c74cd9c0df395d0a9fc18f9'
        );
    }

    generateBlock(blockData) {
        const previousBlock = this.getLastBlock();
        const nextIndex = previousBlock.index + 1;
        const nextTimestamp = new Date().getTime() / 1000;
        const nextHash = Block.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
        return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
    }

    isValidChain(blockchainToValidate) {
        if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.getGenisisBlock())) {
            return false;
        }
        let tempBlocks = [blockchainToValidate[0]];
        for(let i = 1; i < blockchainToValidate.length; i++) {
            if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
                tempBlocks.push(blockchainToValidate[i]);
            }
            else {
                return false;
            }
        }

        return true;
    }

    replaceChain(newBlockchain) {
        if (this.isValidChain(newBlockchain.getFullChain()) && newBlockchain.getFullChain().length > this.blockchain.length) {
            console.log('Received new blocks. Replacing current blockchain');
            this.blockchain = newBlockchain;
        }
    }

    getFullChain() {
        return this.blockchain;
    }
}

module.exports = Blockchain;
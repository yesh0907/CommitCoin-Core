const Block = require('./Block');

class Blockchain {
    constructor() {
        this.blockchain = [this.getGenisisBlock()];
        console.log(this.blockchain);    
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
            console.log('prev hash doesn\' match');
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
            console.log(this.blockchain);
        }
    }
    
    getGenisisBlock() {
        return new Block(
            0, 
            "0", 
            new Date().getTime() / 1000, 
            "Initialized Blockchain"
        );
    }
}

module.exports = Blockchain;
const Block = require('./Block');

class Blockchain {
    constructor() {
        this.blockchain = [this.getGenisisBlock()];
        if (window.localStorage.getItem('CC-Blockchain')) {
            this.replaceChain(JSON.parse(window.localStorage.getItem('CC-Blockchain')));
        }
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
            this.updateStorage();
        }
    }
    
    getGenisisBlock() {
        let time = new Date().getTime() / 1000;
        return new Block(
            0,
            "0", 
            time,
            "Initialized Blockchain",
            Block.calculateHash(0, "0", time, "Initialized Blockchain")
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

    replaceChain(ChainData) {
        let newBlockchain = ChainData.map(e => Block.fromJSON(e));
        if (this.isValidChain(newBlockchain) &&
                (newBlockchain.length > this.blockchain.length ||
                    (newBlockchain.length === this.blockchain.length &&
                    newBlockchain[newBlockchain.length-1].timestamp > this.getLastBlock().timestamp))) {
            console.log('Received new blocks. Replacing current blockchain');
            this.blockchain = newBlockchain;
            this.updateStorage();
        }
    }

    getFullChain() {
        return this.blockchain.map(e => e.toJSON());
    }

    updateStorage() {
        window.localStorage.setItem('CC-Blockchain', JSON.stringify(this.getFullChain()));
    }
}

module.exports = Blockchain;
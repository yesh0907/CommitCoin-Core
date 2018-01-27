const CryptoJS = require('crypto-js');

class Block {
    constructor(index, prevHash, timestamp, data) {
        this.index = index;
        this.prevHash = prevHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = Block.calculateHash(index, prevHash, timestamp, data);
    }
    static calculateHash(index, prevHash, timestamp, data) {
        return CryptoJS.SHA256(index + prevHash + timestamp + data).toString();
    }
    
    static generateBlock(blockData) {
        const previousBlock = getLastBlock();
        const nextIndex = previousBlock.index + 1;
        const nextTimestamp = new Date().getTime() / 1000;
        const nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
        return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
    }
}

module.exports = Block;
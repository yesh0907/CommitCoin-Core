const CryptoJS = require('crypto-js');

class Block {
    constructor(index, prevHash, timestamp, data, hash) {
        this.index = index;
        this.prevHash = prevHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
    static calculateHash(index, prevHash, timestamp, data) {
        return CryptoJS.SHA256(index + prevHash + timestamp + data).toString();
    }
    toJSON() {
        return {
            index: this.index,
            prevHash: this.prevHash,
            timestamp: this.timestamp,
            data: this.data,
            hash: this.hash
        }
    }
    equal(block) {
        return block.index === this.index
            && block.prevHash === this.prevHash
            && block.timestamp === this.timestamp
            && block.data === this.data
            && block.hash === this.hash;
    }
    static fromJSON({ index, prevHash, timestamp, data, hash }) {
        return new Block(index, prevHash, timestamp, data, hash);
    }
}

module.exports = Block;
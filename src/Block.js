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
}

module.exports = Block;
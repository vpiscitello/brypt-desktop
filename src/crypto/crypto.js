let bryptCrypto = require("../../build/Release/brypt-crypto.node");

export class CryptoInterface {
    constructor() {
        this.ban = "bananas";
    }
    run() {
        console.log("Hello");
    }
    getBan() {
        return this.ban;
    }
    encrypt(plaintext, key) {
        let retVal = bryptCrypto.encrypt(plaintext, key);
        console.log(retVal);
    }
    decrypt(ciphertext, key) {
        let retVal = bryptCrypto.decrypt(ciphertext, key);
        console.log(retVal);
    }
}

export default new CryptoInterface();

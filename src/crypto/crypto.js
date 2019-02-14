let bryptCrypto = require("../../build/Release/brypt-crypto.node");

export class CryptoInterface {
    constructor() {

    }
    encrypt(plaintext, key) {
        console.log("Running Encryption...");
        let cipher = bryptCrypto.encrypt(plaintext, key);
        console.log(cipher);
        return cipher;
    }
    decrypt(ciphertext, key) {
        console.log("Running Decryption...");
        let plain = bryptCrypto.decrypt(ciphertext, key);
        console.log(plain);
        return plain;
    }
}

export default new CryptoInterface();

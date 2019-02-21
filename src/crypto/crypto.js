let bryptCrypto = require("../../build/Release/brypt-crypto.node");

export class CryptoInterface {
    constructor() {

    }
    encrypt(plaintext, key) {
        console.log("Running Encryption...");
        let cipher = bryptCrypto.encrypt(plaintext, key);
        console.log(Array.prototype.map.call(new Uint8Array(cipher), x => ('00' + x.toString(16)).slice(-2)).join(''));
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

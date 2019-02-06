#include <node.h>

#include <cstdlib>
#include <cstdio>
#include <iostream>
#include <string.h>
#include <string>

#include "settings.hpp"

#define BUFF_SIZE 512
#define HASH_SIZE 32
#define OUR_KEY_SIZE 32

namespace cryptographic {
    #include <openssl/conf.h>
    #include <openssl/err.h>
    #include <openssl/sha.h>
    #include <openssl/evp.h>
    #include <openssl/hmac.h>
    #include <openssl/des.h>

    // void run(const Settings *options) {
    //
    // }

    void initialize(const Settings *options) {

    }

    std::string aes_ctr_256_encrypt(const unsigned char* plaintext, const unsigned char* key) {
        unsigned char ciphertext[BUFF_SIZE];
        unsigned char* iv;

        int length = 0;
        int ctxt_len = 0;
        int ptxt_len = 0;

    	EVP_CIPHER_CTX *ctx;

        iv = (unsigned char *)"0123456789012345";

    	ctx = EVP_CIPHER_CTX_new();

    	EVP_EncryptInit_ex(ctx, EVP_aes_256_ctr(), NULL, key, iv);
    	EVP_EncryptUpdate(ctx, ciphertext, &length, plaintext, ptxt_len);
    	ctxt_len = length;
    	EVP_EncryptFinal_ex(ctx, ciphertext + length, &length);
    	ctxt_len += length;
    	EVP_CIPHER_CTX_free(ctx);

        return std::string(reinterpret_cast<char*>(ciphertext));

    	// printf("AES CTR 256 Initial Plaintext:\n");
    	// printf("%s\n\n", plaintext);
    	// printf("AES CTR 256 Ciphertext (hex representation):\n");
    	// print_output(ciphertext, ctxt_len);
    }

    void aes_ctr_256_decrypt() {
        // int length;
    	// int plaintext_len = 0;
    	// EVP_CIPHER_CTX *ctx;
        //
    	// clear_decryptedtext();
        //
    	// ctx = EVP_CIPHER_CTX_new();
        //
    	// EVP_DecryptInit_ex(ctx, EVP_aes_256_ctr(), NULL, key, iv);
    	// EVP_DecryptUpdate(ctx, decryptedtext, &length, ciphertext, ctxt_len);
    	// plaintext_len += length;
    	// EVP_DecryptFinal_ex(ctx, decryptedtext + length, &length);
    	// plaintext_len += length;
    	// EVP_CIPHER_CTX_free(ctx);
        //
    	// printf("AES CTR 256 Decrypted text:\n");
    	// decryptedtext[plaintext_len] = '\0';
    	// printf("%s\n\n", decryptedtext);
    }

}

namespace interface {

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;

    using namespace cryptographic;

    void Crypto(const FunctionCallbackInfo<Value> &args) {
        Isolate* isolate = args.GetIsolate();
        Settings* options = new Settings();

        options->Configure(args);
        cryptographic::initialize(options);

        args.GetReturnValue().Set(0);
    }

    void Encrypt(const FunctionCallbackInfo<Value> &args) {
        Isolate* isolate = args.GetIsolate();

        v8::String::Utf8Value v8_plaintext(args[0]), v8_key(args[1]);
        std::string plaintext = std::string(*v8_plaintext);
        std::string key = std::string(*v8_key);

        std::string ciphertext = cryptographic::aes_ctr_256_encrypt(
                                    (const unsigned char*)plaintext.c_str(),
                                    (const unsigned char*)key.c_str()
                                 );

        args.GetReturnValue().Set(String::NewFromUtf8(isolate, ciphertext.c_str()));
    }

    void Decrypt(const FunctionCallbackInfo<Value> &args) {
        Isolate* isolate = args.GetIsolate();


        args.GetReturnValue().Set(String::NewFromUtf8(isolate, "Decrypted..."));
    }

    void init(Local<Object> exports) {
        NODE_SET_METHOD(exports, "crypto", Crypto);
        NODE_SET_METHOD(exports, "encrypt", Encrypt);
        NODE_SET_METHOD(exports, "decrypt", Decrypt);
    }

    NODE_MODULE(crypto, init)

}

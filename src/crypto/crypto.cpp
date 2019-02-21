#pragma comment(lib, "crypt32")
#pragma comment(lib, "ws2_32.lib")

#include <v8.h>
#include <nan.h>

#include <cstdlib>
#include <cstdio>
#include <iostream>
#include <string.h>
#include <string>

//#include "settings.hpp"

#define BUFF_SIZE 512
#define HASH_SIZE 32
#define OUR_KEY_SIZE 32

//namespace cryptographic {
    #include <openssl/conf.h>
    #include <openssl/err.h>
    #include <openssl/sha.h>
    #include <openssl/evp.h>
    #include <openssl/hmac.h>
    #include <openssl/des.h>

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;

    // void run(const Settings *options) {
    //
    // }

   // void initialize(const Settings *options) {

   // }
		void clear_buff(unsigned char* ciphertext){
				int i;

				for(i=0; i < BUFF_SIZE; i++) {
				    ciphertext[i] = '\0';
				}
		}

    std::string aes_ctr_128_encrypt(const unsigned char* plaintext, const unsigned char* key) {
        unsigned char ciphertext[BUFF_SIZE];
        unsigned char* iv;

        int length = 0;
        int ctxt_len = 0;
        int ptxt_len = strlen((char *)plaintext); //15;

				clear_buff(ciphertext);

        // memset( plaintext, 0x00, BUFF_SIZE );
        // strncpy( (char *)plaintext, ( char * )p, strlen( ( char * )p ) );
        // ptxt_len = strlen( ( const char * )plaintext );
        // ptxt_len = 16 * ( ptxt_len /  16 ) + 16; //cast to 16-byte blocks

        iv = ( unsigned char * )"0123456789012345";

    	EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();

    	EVP_EncryptInit_ex( ctx, EVP_aes_128_ctr(), NULL, key, iv );

    	EVP_EncryptUpdate( ctx, ciphertext, &length, plaintext, ptxt_len + 1);

    	ctxt_len = length;
    	EVP_EncryptFinal_ex( ctx, ciphertext + length, &length );
    	ctxt_len += length;

    	EVP_CIPHER_CTX_free( ctx );

        return std::string( reinterpret_cast< char * >( ciphertext ) );
    }

    std::string aes_ctr_128_decrypt(const unsigned char* ciphertext, const unsigned char* key, size_t cipherLength) {
      unsigned char decrypted[BUFF_SIZE];
      unsigned char* iv;

      int length = 0;
      int ptxt_len = 0;

      iv = ( unsigned char * )"0123456789012345";

			clear_buff(decrypted);

    	EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();

    	EVP_DecryptInit_ex( ctx, EVP_aes_128_ctr(), NULL, key, iv );

    	EVP_DecryptUpdate( ctx, decrypted, &length, ciphertext, cipherLength );

    	ptxt_len += length;
    	EVP_DecryptFinal_ex( ctx, decrypted + length, &length );
    	ptxt_len += length;

    	EVP_CIPHER_CTX_free( ctx );

        return std::string( reinterpret_cast< char * >( decrypted ) );
    }

    std::string aes_ctr_256_encrypt(const unsigned char* plaintext, const unsigned char* key) {
        unsigned char ciphertext[BUFF_SIZE];
        unsigned char* iv;

        int length = 0;
        int ctxt_len = 0;
        int ptxt_len = strlen((char *)plaintext); //15;

				clear_buff(ciphertext);

        // memset( plaintext, 0x00, BUFF_SIZE );
        // strncpy( (char *)plaintext, ( char * )p, strlen( ( char * )p ) );
        // ptxt_len = strlen( ( const char * )plaintext );
        // ptxt_len = 16 * ( ptxt_len /  16 ) + 16; //cast to 16-byte blocks

        iv = ( unsigned char * )"0123456789012345";

    	EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();

    	EVP_EncryptInit_ex( ctx, EVP_aes_256_ctr(), NULL, key, iv );

    	EVP_EncryptUpdate( ctx, ciphertext, &length, plaintext, ptxt_len + 1);

    	ctxt_len = length;
    	EVP_EncryptFinal_ex( ctx, ciphertext + length, &length );
    	ctxt_len += length;

    	EVP_CIPHER_CTX_free( ctx );

        return std::string( reinterpret_cast< char * >( ciphertext ) );
    }

    std::string aes_ctr_256_decrypt(const unsigned char* ciphertext, const unsigned char* key, size_t cipherLength) {
      unsigned char decrypted[BUFF_SIZE];
      unsigned char* iv;

      int length = 0;
      int ptxt_len = 0;

      iv = ( unsigned char * )"0123456789012345";

			clear_buff(decrypted);
    	
			EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();

    	EVP_DecryptInit_ex( ctx, EVP_aes_256_ctr(), NULL, key, iv );

    	EVP_DecryptUpdate( ctx, decrypted, &length, ciphertext, cipherLength );

    	ptxt_len += length;
    	EVP_DecryptFinal_ex( ctx, decrypted + length, &length );
    	ptxt_len += length;

    	EVP_CIPHER_CTX_free( ctx );

        return std::string( reinterpret_cast< char * >( decrypted ) );
    }

		std::string hmac_sha2(const unsigned char* input, size_t inputLen, const unsigned char* key) {
			const EVP_MD *md;
			md = EVP_get_digestbyname("sha256");
			
			unsigned int length = 0;
			unsigned char* digest;
			digest = HMAC(md, key, strlen((char *)key), input, inputLen, NULL, &length);
			return std::string( reinterpret_cast<char*>(digest));
		}

		std::string hmac_blake2s(const unsigned char* input, size_t inputLen, const unsigned char* key) {
	//		EVP_MD_CTX *mdctx;
			const EVP_MD *md;
			md = EVP_get_digestbyname("blake2s256");
//			mdctx = EVP_MD_CTX_new();
						
			unsigned int length = 0;
			unsigned char* digest;
			digest = HMAC(md, key, strlen((char *)key), input, inputLen, NULL, &length);
			return std::string( reinterpret_cast<char*>(digest));
		}
//}

//namespace interface {

 //   using namespace cryptographic;

    void Crypto(const FunctionCallbackInfo<Value> &args) {
        Isolate* isolate = args.GetIsolate();
       // Settings* options = new Settings();

       // options->Configure(args);
       // initialize(options);

        args.GetReturnValue().Set(0);
    }

		void Encrypt(const FunctionCallbackInfo<Value> &args) {
        Isolate* isolate = args.GetIsolate();

        // v8::String::Utf8Value v8_plaintext(isolate, args[0]), v8_key(isolate, args[1]);
        v8::String::Utf8Value v8_plaintext( args[ 0 ] ), v8_key( args[ 1 ] );
        std::string plaintext = std::string( *v8_plaintext );
        std::string key = std::string( *v8_key );

       /* std::string cipher = aes_ctr_256_encrypt(
                                ( const unsigned char * ) plaintext.c_str(),
                                ( const unsigned char * ) key.c_str()
                             );
*/
     /*   std::string cipher = aes_ctr_128_encrypt(
                                ( const unsigned char * ) plaintext.c_str(),
                                ( const unsigned char * ) key.c_str()
                             );*/

/*				std::string cipher = hmac_sha2(
															(const unsigned char*) plaintext.c_str(),
															strlen((char*) plaintext.c_str()),
															(const unsigned char*) key.c_str()
														);
	*/			
				std::string cipher = hmac_blake2s(
															(const unsigned char*) plaintext.c_str(),
															strlen((char*) plaintext.c_str()),
															(const unsigned char*) key.c_str()
														);
        char * cstr_cipher = ( char * ) cipher.c_str();

        args.GetReturnValue().Set(
            node::Buffer::Copy( isolate, cstr_cipher, cipher.size() )
            .ToLocalChecked()
        );
    }

    void Decrypt(const FunctionCallbackInfo<Value> &args) {
        Isolate* isolate = args.GetIsolate();

        Local<Object> cipherBuffer = args[ 0 ]->ToObject();
        char * cipher = node::Buffer::Data( cipherBuffer );
        size_t cipherLength = node::Buffer::Length( cipherBuffer );

        v8::String::Utf8Value v8_key( args[ 1 ] );
        std::string key = std::string( *v8_key );

      /*  std::string decrypted = aes_ctr_256_decrypt(
                                ( const unsigned char * ) cipher,
                                ( const unsigned char * ) key.c_str(),
                                cipherLength
                             );
*/
        std::string decrypted = aes_ctr_128_decrypt(
                                ( const unsigned char * ) cipher,
                                ( const unsigned char * ) key.c_str(),
                                cipherLength
                             );

        args.GetReturnValue().Set(
            String::NewFromUtf8( isolate, decrypted.c_str() )
        );
    }

    void init(Local<Object> exports) {
        // NODE_SET_METHOD(exports, "crypto", Crypto);
        NODE_SET_METHOD(exports, "encrypt", Encrypt);
        NODE_SET_METHOD(exports, "decrypt", Decrypt);
    }

    NODE_MODULE(crypto, init)

//}

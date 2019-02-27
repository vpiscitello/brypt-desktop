#ifndef MESSAGE_HPP
#define MESSAGE_HPP

#pragma comment(lib, "crypt32")
#pragma comment(lib, "ws2_32.lib")

// #include <v8.h>
#include <napi.h>

#include <cstdlib>
#include <cstdio>
#include <iostream>
#include <string.h>
#include <string>

#include <chrono>
#include <sstream>
#include <functional>

#include "utility.hpp"

#include <openssl/conf.h>
#include <openssl/err.h>
#include <openssl/sha.h>
#include <openssl/evp.h>
#include <openssl/hmac.h>

class Message {
    private:
        std::string raw;                // Raw string format of the message

        std::string node_id;            // ID of the sending node

        CommandType command;            // Command type to be run
        unsigned int phase;                      // Phase of the Command state

        std::string data;               // Encrypted data to be sent
				unsigned int dataLen;						// Length of data/ctxt

        std::string timestamp;          // Current timestamp
				
				std::string key;								// Key used for crypto 
				unsigned int keyLen;						// Key length
				std::string digest;					// Message digest (HMAC of ctxt/data) 
        class Message * response;             // A circular message for the response to the current message

        std::string auth_token;         // Current authentication token created via HMAC
        unsigned char nonce;             // Current message nonce

        enum MessageChunk {
            NODEID_CHUNK, COMMAND_CHUNK, PHASE_CHUNK, NONCE_CHUNK, DATASIZE_CHUNK, DATA_CHUNK, TIMESTAMP_CHUNK,
            FIRST_CHUNK = NODEID_CHUNK,
            LAST_CHUNK = TIMESTAMP_CHUNK
        };

    public:
        // Constructors Functions
        Message();
        Message(std::string raw, std::string key);
        Message(std::string node_id, CommandType command, int phase, std::string data, std::string key, unsigned int nonce);

        // Getter Functions
        std::string get_node_id();
        CommandType get_command();
        unsigned int get_phase();
        std::string get_data();
        unsigned int get_dataLen();
        std::string get_key();
        unsigned int get_keyLen();
        unsigned int get_nonce();
        std::string get_timestamp();
        std::string get_pack();
        std::string get_response();

        // Setter Functions
        void set_node_id(std::string node_id);
        void set_command(CommandType command, int phase);
        void set_data(std::string data);
        void set_nonce(unsigned int nonce);
        void set_timestamp();
        void set_response(std::string node_id, std::string data, int phase);

        // Utility Functions
        std::string pack_chunk(std::string content);
        std::string pack_chunk(unsigned int content);
        void pack();
        void unpack();
				void clear_buff(unsigned char* buff, unsigned int buffLen);
				std::string aes_ctr_128_encrypt(std::string mssg, unsigned int mssgLen);
				std::string aes_ctr_128_decrypt(std::string mssg, unsigned int mssgLen);
				std::string aes_ctr_256_encrypt(std::string mssg, unsigned int mssgLen);
				std::string aes_ctr_256_decrypt(std::string mssg, unsigned int mssgLen);
        std::string hmac(std::string message);
				std::string hmac_sha2();
				std::string hmac_blake2s();
        bool verify();
};

class MessageWrapper : public Napi::ObjectWrap<MessageWrapper> {
    public:
        static Napi::Object Init(Napi::Env env, Napi::Object exports);
        MessageWrapper(const Napi::CallbackInfo& info);

    private:
        static Napi::FunctionReference constructor;

        Napi::Value GetSender(const Napi::CallbackInfo& info);
        Napi::Value GetCommand(const Napi::CallbackInfo& info);
        Napi::Value GetPhase(const Napi::CallbackInfo& info);
        Napi::Value GetData(const Napi::CallbackInfo& info);
        Napi::Value GetNonce(const Napi::CallbackInfo& info);
        Napi::Value GetTimestamp(const Napi::CallbackInfo& info);
        Napi::Value GetPack(const Napi::CallbackInfo& info);

        Napi::Value SetResponse(const Napi::CallbackInfo& info);
        Napi::Value GetResponse(const Napi::CallbackInfo& info);
      //  Napi::Value GetHmacSha2(const Napi::CallbackInfo& info);
      //  Napi::Value GetHmacBlake2s(const Napi::CallbackInfo& info);

        // Napi::Value HMAC(const Napi::CallbackInfo& info);
        // Napi::Value Verify(const Napi::CallbackInfo& info);

        class Message * internal_message;

};

#endif

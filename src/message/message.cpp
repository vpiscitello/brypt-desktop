#include "message.hpp"

// Constructors Functions
/* **************************************************************************
** Function: Default Message Constructor
** Description: Initializes all class variables to default values.
** *************************************************************************/
Message::Message() {
    this->raw = "";
    this->node_id = "";
    this->command = NULL_CMD;
    this->phase = -1;
    this->data = "";
    this->timestamp = "";
    this->response = NULL;
    this->auth_token = "";
    this->nonce = 0;
    this->set_timestamp();
}
/* **************************************************************************
** Function: Constructor for Recieved Messages
** Description: Takes raw string input and unpacks it into the class variables.
** *************************************************************************/
Message::Message(std::string raw, std::string key) {
    this->raw = raw;
		this->key = key;
    this->unpack();
		this->aes_ctr_128_decrypt(this->data, this->data.size());
    this->response = NULL;
}
/* **************************************************************************
** Function: Constructor for new Messages
** Description: Initializes new messages provided the intended values.
** *************************************************************************/
Message::Message(std::string node_id, CommandType command, int phase, std::string data, std::string key, unsigned int nonce) {
    this->raw = "";
    this->node_id = node_id;
    this->command = command;
    this->phase = phase;
    this->data = data;
    this->timestamp = "";
    this->response = NULL;
    this->auth_token = "";
    this->nonce = nonce;
    this->set_timestamp();
		this->key = key;
		this->aes_ctr_128_encrypt(this->data, this->data.size());
}

// Getter Functions
/* **************************************************************************
** Function: get_node_id
** Description: Return the ID of the Node that sent the message.
** *************************************************************************/
std::string Message::get_node_id() {
    return this->node_id;
}
/* **************************************************************************
** Function: get_command
** Description: Return the designated command to handle the message.
** *************************************************************************/
CommandType Message::get_command() {
    return this->command;
}
/* **************************************************************************
** Function: get_phase
** Description: Return the commands phase.
** *************************************************************************/
unsigned int Message::get_phase() {
    return this->phase;
}
/* **************************************************************************
** Function: get_data
** Description: Return the data content of the message.
** *************************************************************************/
std::string Message::get_data() {
    return this->data;
}
/* **************************************************************************
** Function: get_dataLen
** Description: Return the length of the data content of the message.
** *************************************************************************/
unsigned int Message::get_dataLen() {
    return this->dataLen;
}
/* **************************************************************************
** Function: get_key
** Description: Return the key.
** *************************************************************************/
std::string Message::get_key() { // TODO: remove
    return this->key;
}
/* **************************************************************************
** Function: get_keyLen
** Description: Return the key length.
** *************************************************************************/
unsigned int Message::get_keyLen() { // TODO: remove
    return this->keyLen;
}
/* **************************************************************************
** Function: get_nonce
** Description: Return the nonce.
** *************************************************************************/
unsigned int Message::get_nonce() {
    return this->nonce;
}
/* **************************************************************************
** Function: get_timestamp
** Description: Return the timestamp of when the message was created.
** *************************************************************************/
std::string Message::get_timestamp() {
    return this->timestamp;
}
/* **************************************************************************
** Function: get_pack
** Description: Return the packed data of the message. If it has not been
** sent pack the data first.
** *************************************************************************/
std::string Message::get_pack() {
    if ( this->raw == "" ) {
        this->pack();
    }
    return this->raw + this->auth_token;
}
/* **************************************************************************
** Function: get_response
** Description: Return the Response for the message.
** *************************************************************************/
std::string Message::get_response() {
    if ( this->response == NULL ) {
        return "";
    }
    return this->response->get_pack();
}

// Setter Functions
/* **************************************************************************
** Function: set_node_id
** Description: Set the Node ID of the message.
** *************************************************************************/
void Message::set_node_id(std::string node_id) {
    this->node_id = node_id;
}
/* **************************************************************************
** Function: set_command
** Description: Set the command of the message.
** *************************************************************************/
void Message::set_command(CommandType command, int phase) {
    this->command = command;
    this->phase = phase;
}
/* **************************************************************************
** Function: set_data
** Description: Set the data content of the message.
** *************************************************************************/
void Message::set_data(std::string data) {
    this->data = data;
}
/* **************************************************************************
** Function: set_nonce
** Description: Set the current nonce of the message.
** *************************************************************************/
void Message::set_nonce(unsigned int nonce) {
    this->nonce = nonce;
}
/* **************************************************************************
** Function: set_timestamp
** Description: Determine the timestamp of the message using the system clock.
** *************************************************************************/
void Message::set_timestamp() {
    std::stringstream ss;
    std::chrono::seconds seconds;
    std::chrono::time_point<std::chrono::system_clock> current_time;
    current_time = std::chrono::system_clock::now();
    seconds = std::chrono::duration_cast<std::chrono::seconds>( current_time.time_since_epoch() );
    ss.clear();
    ss << seconds.count();
    this->timestamp = ss.str();
}
/* **************************************************************************
** Function: set_response
** Description: Set the message Response provided the data content and sending
** Node ID.
** *************************************************************************/
void Message::set_response(std::string node_id, std::string data, int phase) {
    if (this->response == NULL) {
        this->response = new Message(node_id, this->command, phase, data, this->key, this->nonce + 1);
    } else {
        this->response->set_node_id( node_id );
        this->response->set_command( this->command, phase);
        this->response->set_data( data );
        this->response->set_nonce( this->nonce + 1 );
    }
}

// Utility Functions
/* **************************************************************************
** Function: pack_chunk
** Description: Wrap a string message chunk with seperators.
** *************************************************************************/
std::string Message::pack_chunk(std::string content) {
    std::string packed;
    packed.append( 1, 2 );	// Start of telemetry chunk
    packed.append( content );
    packed.append( 1, 3 );	// End of telemetry chunk
    packed.append( 1, 29 );	// Telemetry seperator
    return packed;
}
/* **************************************************************************
** Function: pack_chunk
** Description: Wrap an unsigned int message chunk with seperators.
** *************************************************************************/
std::string Message::pack_chunk(unsigned int content) {
    std::string packed;
    std::stringstream ss;
    ss.clear();
    packed.append( 1, 2 );	// Start of telemetry chunk
    ss << content;
    packed.append( ss.str() );
    packed.append( 1, 3 );	// End of telemetry chunk
    packed.append( 1, 29 );	// Telemetry seperator
    return packed;
}
/* **************************************************************************
** Function: pack
** Description: Pack the Message class values into a single raw string.
** *************************************************************************/
void Message::pack() {
    std::string packed;

    packed.append( 1, 1 );	// Start of telemetry pack

    packed.append( this->pack_chunk( this->node_id ) );
    packed.append( this->pack_chunk( (unsigned int)this->command ) );
    packed.append( this->pack_chunk( (unsigned int)this->phase ) );
    packed.append( this->pack_chunk( (unsigned int)this->nonce ) );
    packed.append( this->pack_chunk( (unsigned int)this->data.size() ) );
    packed.append( this->pack_chunk( this->data ) );
    packed.append( this->pack_chunk( this->timestamp ) );

    packed.append( 1, 4 );	// End of telemetry pack

    this->auth_token = this->hmac_sha2( packed , packed.size() ); 
    this->raw = packed;
}
/* **************************************************************************
** Function: unpack
** Description: Unpack the raw message string into the Message class variables.
** *************************************************************************/
void Message::unpack() {
    int loops = 0;
    MessageChunk chunk = FIRST_CHUNK;
    std::size_t last_end = 0;
    std::size_t data_size = 0;

    // Iterate while there are message chunks to be parsed.
    while (chunk <= LAST_CHUNK ) {
        std::size_t chunk_end = this->raw.find( ( char ) 29, last_end + 1 );     // Find chunk seperator

        switch (chunk) {
            // Node ID
            case NODEID_CHUNK:
                this->node_id = this->raw.substr( last_end + 2, ( chunk_end - 1 ) - ( last_end + 2) );
                break;
            // Command Type
            case COMMAND_CHUNK:
                this->command = ( CommandType ) std::stoi(
                                    this->raw.substr( last_end + 2, ( chunk_end - 1 ) - ( last_end + 2) )
                                );
                break;
            // Command Phase
            case PHASE_CHUNK:
                this->phase = std::stoi(
                                this->raw.substr( last_end + 2, ( chunk_end - 1 ) - ( last_end + 2) )
                              );
                break;
            // Nonce
            case NONCE_CHUNK:
                this->nonce = std::stoi(
                                this->raw.substr( last_end + 2, ( chunk_end - 1 ) - ( last_end + 2) )
                              );
                break;
            // Data Size
            case DATASIZE_CHUNK:
                data_size = ( std::size_t ) std::stoi(
                                this->raw.substr( last_end + 2, ( chunk_end - 1 ) - ( last_end + 2) )
                            );
                break;
            // Data
            case DATA_CHUNK:
                this->data = this->raw.substr( last_end + 2, data_size );
                break;
            // Timestamp
            case TIMESTAMP_CHUNK:
                this->timestamp = this->raw.substr( last_end + 2, ( chunk_end - 1 ) - ( last_end + 2) );
                break;
            // End of Message Parsing
            default:
                break;
        }

        last_end = chunk_end;
        loops++; chunk = (MessageChunk) loops;
    }

    this->auth_token = this->raw.substr( last_end + 2 );
    this->raw = this->raw.substr( 0, ( this->raw.size() - this->auth_token.size() ) );

}

void Message::clear_buff(unsigned char* buff, unsigned int buffLen){
		unsigned int i;
		for(i=0; i < buffLen; i++){
			buff[i] = '\0';
		}
}

/* **************************************************************************
** Function: aes_ctr_128_encrypt
** Description: Encrypt a provided message with AES-CTR-128 and return ciphertext.
** *************************************************************************/
std::string Message::aes_ctr_128_encrypt(std::string mssg, unsigned int mssgLen) {
     unsigned char ciphertext[512];	// Temp buffer
     unsigned char* iv;

     int length = 0;
     this->dataLen = 0;

     clear_buff(ciphertext, 512);
    
		 void* temp = (void *)this->nonce; 
		 iv = (unsigned char *)temp;

     EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
     EVP_EncryptInit_ex( ctx, EVP_aes_128_ctr(), NULL, (const unsigned char*)this->key.c_str(), iv );
     EVP_EncryptUpdate( ctx, ciphertext, &length, (const unsigned char*)mssg.c_str(), mssgLen + 1);

     dataLen = length;
     EVP_EncryptFinal_ex( ctx, ciphertext + length, &length );
     dataLen += length;

     EVP_CIPHER_CTX_free( ctx );
		 strncpy((char *)this->data.c_str(), (char *)ciphertext, 512);

     return std::string( reinterpret_cast< char * >( ciphertext ) );
}

/* **************************************************************************
** Function: aes_ctr_128_decrypt
** Description: Decrypt a provided message with AES-CTR-128 and return decrypted text.
** *************************************************************************/
std::string Message::aes_ctr_128_decrypt(std::string mssg, unsigned int mssgLen) {
     unsigned char decryptedtext[512];	// Temp buffer
     unsigned char* iv;

     int length = 0;
     this->dataLen = 0;

     clear_buff(decryptedtext, 512);
    
		 void* temp = (void *)this->nonce; 
		 iv = (unsigned char *)temp;

     EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
     EVP_DecryptInit_ex( ctx, EVP_aes_128_ctr(), NULL, (const unsigned char*)this->key.c_str(), iv );
     EVP_DecryptUpdate( ctx, decryptedtext, &length, (const unsigned char*)mssg.c_str(), mssgLen);

     dataLen = length;
     EVP_DecryptFinal_ex( ctx, decryptedtext + length, &length );
     dataLen += length;

     EVP_CIPHER_CTX_free( ctx );
		 strncpy((char *)this->data.c_str(), (char *)decryptedtext, 512);

     return std::string( reinterpret_cast< char * >( decryptedtext ) );
}

/* **************************************************************************
** Function: aes_ctr_256_encrypt
** Description: Encrypt a provided message with AES-CTR-256 and return ciphertext.
** *************************************************************************/
std::string Message::aes_ctr_256_encrypt(std::string mssg, unsigned int mssgLen) {
     unsigned char ciphertext[512];	// Temp buffer
     unsigned char* iv;

     int length = 0;
     this->dataLen = 0;

     clear_buff(ciphertext, 512);

     void *temp = (void*)this->nonce; 
		 iv = ( unsigned char * )temp;

     EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
     EVP_EncryptInit_ex( ctx, EVP_aes_256_ctr(), NULL, (const unsigned char*)this->key.c_str(), iv );
     EVP_EncryptUpdate( ctx, ciphertext, &length, (const unsigned char*)mssg.c_str(), mssgLen + 1);

     dataLen = length;
     EVP_EncryptFinal_ex( ctx, ciphertext + length, &length );
     dataLen += length;

     EVP_CIPHER_CTX_free( ctx );
		 strncpy((char *)this->data.c_str(), (char *)ciphertext, 512);

     return std::string( reinterpret_cast< char * >( ciphertext ) );
}

/* **************************************************************************
** Function: aes_ctr_256_decrypt
** Description: Decrypt a provided message with AES-CTR-256 and return decrypted text.
** *************************************************************************/
std::string Message::aes_ctr_256_decrypt(std::string mssg, unsigned int mssgLen) {
     unsigned char decryptedtext[512];	// Temp buffer
     unsigned char* iv;

     int length = 0;
     this->dataLen = 0;

     clear_buff(decryptedtext, 512);
    
		 void* temp = (void *)this->nonce; 
		 iv = (unsigned char *)temp;

     EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
     EVP_DecryptInit_ex( ctx, EVP_aes_256_ctr(), NULL, (const unsigned char*)this->key.c_str(), iv );
     EVP_DecryptUpdate( ctx, decryptedtext, &length, (const unsigned char*)mssg.c_str(), mssgLen);

     dataLen = length;
     EVP_DecryptFinal_ex( ctx, decryptedtext + length, &length );
     dataLen += length;

     EVP_CIPHER_CTX_free( ctx );
		 strncpy((char *)this->data.c_str(), (char *)decryptedtext, 512);

     return std::string( reinterpret_cast< char * >( decryptedtext ) );
}

/* **************************************************************************
** Function: hmac_sha2
** Description: HMAC SHA2 a provided message and return the authentication token.
** *************************************************************************/
std::string Message::hmac_sha2(std::string mssgData, int mssgLen) {
				const EVP_MD *md;
				md = EVP_get_digestbyname("sha256");
				const unsigned char* mssg = (const unsigned char*)mssgData.c_str();
				const unsigned char* k = (const unsigned char*)key.c_str();
			//	unsigned int dataLen = get_dataLen();
			//	unsigned int keyLen = get_keyLen();
				unsigned int length = 0;
				unsigned char* d;
				d = HMAC(md, k, this->keyLen, mssg, mssgLen, NULL, &length);
    		std::string cppDigest = (char*)d;
		return cppDigest;
}

/* **************************************************************************
** Function: hmac_blake2s
** Description: HMAC Blake2s a provided message and return the authentication token.
** *************************************************************************/
std::string Message::hmac_blake2s(std::string mssgData, int mssgLen) {
				const EVP_MD *md;
				md = EVP_get_digestbyname("blake2s256");
				const unsigned char* mssg = (const unsigned char*)mssgData.c_str();
				const unsigned char* k = (const unsigned char*)key.c_str();
			//	unsigned int dataLen = this->internal_message->get_dataLen();
			//	unsigned int keyLen = this->internal_message->get_keyLen();
				unsigned int length = 0;
				unsigned char* d;
				d = HMAC(md, k, this->keyLen, mssg, mssgLen, NULL, &length);
    		std::string cppDigest = (char*)d;
		return cppDigest;
}

/* **************************************************************************
** Function: hmac
** Description: HMAC a provided message and return the authentication token.
** *************************************************************************/
std::string Message::hmac(std::string message) {
    int key = 3005;
    std::stringstream token, inner, in_key, out_key;

    unsigned long in_val = ( ( unsigned long ) key ^ ( 0x5c * 32 ) );      // Get the inner key
    unsigned long out_val = ( ( unsigned long ) key ^ ( 0x36 * 32 ) );     // Get the outer key
    in_key << in_val;
    out_key << out_val;

    inner << std::hash<std::string>{}( in_key.str() + message );
    token << std::hash<std::string>{}( out_key.str() + inner.str() );      // Generate the HMAC

    // token = std::hash<std::string>{}(
    //                 out_key.str() +
    //                 std::hash<std::string>{}( in_key.str() + message )
    //         );      // Generate the HMAC

    return token.str();
}
/* **************************************************************************
** Function: verify
** Description: Compare the Message token with the computed HMAC.
** *************************************************************************/
bool Message::verify() {
    bool verified = false;
    std::string check_token = "";

    if (this->raw != "" || this->auth_token != "") {
        check_token = this->hmac_sha2( this->raw , this->raw.size() );
        if (this->auth_token == check_token) {
            verified = true;
        }
    }

    return verified;
}


// MessageWrapper

Napi::FunctionReference MessageWrapper::constructor;

Napi::Object MessageWrapper::Init(Napi::Env env, Napi::Object exports) {
Napi::HandleScope scope(env);

Napi::Function func = DefineClass(env, "Init", {
    InstanceMethod("getSender", &MessageWrapper::GetSender),
    InstanceMethod("getCommand", &MessageWrapper::GetCommand),
    InstanceMethod("getPhase", &MessageWrapper::GetPhase),
    InstanceMethod("getData", &MessageWrapper::GetData),
    InstanceMethod("getNonce", &MessageWrapper::GetNonce),
    InstanceMethod("getTimestamp", &MessageWrapper::GetTimestamp),
    InstanceMethod("getPack", &MessageWrapper::GetPack),
    InstanceMethod("setResponse", &MessageWrapper::SetResponse),
    InstanceMethod("getResponse", &MessageWrapper::GetResponse),
  //  InstanceMethod("getHmacSha2", &MessageWrapper::GetHmacSha2),
   // InstanceMethod("getHmacBlake2s", &MessageWrapper::GetHmacBlake2s),

    // InstanceMethod("hmac", &MessageWrapper::GetPack),
    // InstanceMethod("verify", &MessageWrapper::GetPack),
});

constructor = Napi::Persistent(func);
constructor.SuppressDestruct();

exports.Set("Init", func);
    return exports;
}

MessageWrapper::MessageWrapper(const Napi::CallbackInfo& info) : Napi::ObjectWrap<MessageWrapper>(info)  {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    int argc = info.Length();

    switch (argc) {
        case 1: {
            if (!info[0].IsString()) {
                Napi::TypeError::New(env, "Expected Raw String").ThrowAsJavaScriptException();
            }

            if (!info[1].IsString()) {
                Napi::TypeError::New(env, "Expected Key String").ThrowAsJavaScriptException();
            }
            // Raw String Argument
            std::string raw_string = info[0].As<Napi::String>();    // Get the Raw Message String
            std::string key        = info[1].As<Napi::String>();    // Get the message key

            if (raw_string == "") {
                Napi::TypeError::New(env,  "Raw String is Empty").ThrowAsJavaScriptException();
            }

            try {
                this->internal_message = new Message( raw_string, key );
            } catch (...) {
                std::string err_msg = "Error instantiating message class with \"" + raw_string + "\"";
                Napi::TypeError::New(env, err_msg).ThrowAsJavaScriptException();
            }

            break;
        }
        case 5: {
            if (!info[0].IsString()) {
                Napi::TypeError::New(env, "Node ID String Expected").ThrowAsJavaScriptException();
            }

            if (!info[1].IsNumber()) {
                Napi::TypeError::New(env, "Command Number Expected").ThrowAsJavaScriptException();
            }

            if (!info[2].IsNumber()) {
                Napi::TypeError::New(env, "Phase Number Expected").ThrowAsJavaScriptException();
            }

            if (!info[3].IsString()) {
                Napi::TypeError::New(env, "Data String Expected").ThrowAsJavaScriptException();
            }

            if (!info[4].IsString()) {
                Napi::TypeError::New(env, "Key String Expected").ThrowAsJavaScriptException();
            }

            if (!info[5].IsNumber()) {
                Napi::TypeError::New(env, "Nonce Number Expected").ThrowAsJavaScriptException();
            }

            // New Message Arguments
            std::string node_id = info[0].As<Napi::String>();                           // Get the message sender ID
            CommandType command = ( CommandType )( int ) info[1].As<Napi::Number>();    // Get the message command type
            int phase           = info[2].As<Napi::Number>();                           // Get the message command phase
            std::string data    = info[3].As<Napi::String>();                           // Get the message data
            std::string key     = info[4].As<Napi::String>();                           // Get the message key
            unsigned int nonce  = ( unsigned int ) info[5].As<Napi::Number>();          // Get the message key nonce

            this->internal_message = new Message( node_id, command, phase, data, key, nonce );
            break;
        }
        default: {
            Napi::Error::New(env, "Invalid Number of Arguements. You can parse a message from a raw string OR create a new message by providing the Sender ID, Command, Phase, Data, and Nonce.").ThrowAsJavaScriptException();
            break;
        }
    }

}

Napi::Value MessageWrapper::GetSender(const Napi::CallbackInfo& info) {
    std::string node_id = this->internal_message->get_node_id();
    return Napi::String::New(info.Env(), node_id);
}

Napi::Value MessageWrapper::GetCommand(const Napi::CallbackInfo& info) {
    int command = ( int ) this->internal_message->get_command();
    return Napi::Number::New(info.Env(), command);
}

Napi::Value MessageWrapper::GetPhase(const Napi::CallbackInfo& info) {
    int phase = this->internal_message->get_phase();
    return Napi::Number::New(info.Env(), phase);
}

Napi::Value MessageWrapper::GetData(const Napi::CallbackInfo& info) {
    std::string data = this->internal_message->get_data();
    return Napi::String::New(info.Env(), data);
}

Napi::Value MessageWrapper::GetNonce(const Napi::CallbackInfo& info) {
    int nonce = this->internal_message->get_nonce();
    return Napi::Number::New(info.Env(), nonce);
}

Napi::Value MessageWrapper::GetTimestamp(const Napi::CallbackInfo& info) {
    std::string timestamp = this->internal_message->get_timestamp();
    return Napi::String::New(info.Env(), timestamp);
}

Napi::Value MessageWrapper::GetPack(const Napi::CallbackInfo& info) {
    std::string pack = this->internal_message->get_pack();
    return Napi::String::New(info.Env(), pack);
}

Napi::Value MessageWrapper::SetResponse(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    int argc = info.Length();

    if (argc != 3) {
        Napi::Error::New(env, "Invalid Number of Arguements. Set the Response by providing your ID, Data, and Command Phase.").ThrowAsJavaScriptException();
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "Node ID String Expected").ThrowAsJavaScriptException();
    }

    if (!info[1].IsString()) {
        Napi::TypeError::New(env, "Data String Expected").ThrowAsJavaScriptException();
    }

    if (!info[2].IsNumber()) {
        Napi::TypeError::New(env, "Phase Number Expected").ThrowAsJavaScriptException();
    }

    std::string node_id = info[0].As<Napi::String>();                           // Get the message sender ID
    std::string data    = info[1].As<Napi::String>();                           // Get the message data
    int phase           = info[2].As<Napi::Number>();                           // Get the message command phase

    this->internal_message->set_response(node_id, data, phase);

    return Napi::Boolean::New(info.Env(), true);
}

Napi::Value MessageWrapper::GetResponse(const Napi::CallbackInfo& info) {
    std::string pack = this->internal_message->get_response();
    return Napi::String::New(info.Env(), pack);
}


/*std::string Message::hmac_sha2() {
				const EVP_MD *md;
				md = EVP_get_digestbyname("sha256");
				const unsigned char* data = (const unsigned char*)(this->internal_message->get_data()).c_str();
				const unsigned char* key = (const unsigned char*)(this->internal_message->get_key()).c_str();
				unsigned int dataLen = this->internal_message->get_dataLen();
				unsigned int keyLen = this->internal_message->get_keyLen();
				unsigned int length = 0;
				unsigned char* digest;
				digest = HMAC(md, key, keyLen, data, dataLen, NULL, &length);
    		std::string cppDigest = (char*)digest;
		return cppDigest;
}

std::string Message::hmac_blake2s() {
				const EVP_MD *md;
				md = EVP_get_digestbyname("blake2s256");
				const unsigned char* data = (const unsigned char*)(this->internal_message->get_data()).c_str();
				const unsigned char* key = (const unsigned char*)(this->internal_message->get_key()).c_str();
				unsigned int dataLen = this->internal_message->get_dataLen();
				unsigned int keyLen = this->internal_message->get_keyLen();
				unsigned int length = 0;
				unsigned char* digest;
				digest = HMAC(md, key, keyLen, data, dataLen, NULL, &length);
    		std::string cppDigest = (char*)digest;
		return cppDigest;
}
*/
